const path = require('path');
const http = require('http');
const os = require('os');
const cookieParser = require('cookie-parser');

const express = require('express');
const { Server } = require('socket.io');

const { createCall } = require('./modules/sipSimulator');
const { RtpAnalyzer } = require('./modules/rtpAnalyzer');
const { parseSipLogFile } = require('./modules/pcapParser');
const { startEventSimulator } = require('./modules/eventSimulator');
const { verifySessionToken } = require('./modules/auth');
const { initDatabase } = require('./modules/database');
const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : true,
    methods: ['GET', 'POST']
  }
});

// Initialize database
let dbInitialized = false;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Authentication middleware
function requireAuth(req, res, next) {
  const token = req.cookies.voipSession;
  
  if (!token) {
    // Check if requesting login page or static assets
    if (req.path === '/login.html' || req.path === '/login.js' || 
        req.path.startsWith('/node_modules/') || 
        req.path.endsWith('.css') || 
        req.path.endsWith('.js') && req.path !== '/login.js') {
      return next();
    }
    return res.redirect('/login.html');
  }
  
  const verification = verifySessionToken(token);
  
  if (!verification.valid) {
    // Clear invalid token
    res.clearCookie('voipSession');
    
    // Check if requesting login page or static assets
    if (req.path === '/login.html' || req.path === '/login.js' || 
        req.path.startsWith('/node_modules/') || 
        req.path.endsWith('.css') || 
        req.path.endsWith('.js') && req.path !== '/login.js') {
      return next();
    }
    return res.redirect('/login.html');
  }
  
  // Add user info to request
  req.user = verification.user;
  next();
}

// Apply auth middleware to all routes except login and auth API
app.use((req, res, next) => {
  if (req.path.startsWith('/auth/')) {
    return next();
  }
  requireAuth(req, res, next);
});

// Auth routes
app.use('/auth', authRoutes);

// Legacy logout route (redirect to auth)
app.post('/logout', (req, res) => {
  res.redirect('/auth/logout');
});

const state = {
  calls: new Map(),
};

const rtpAnalyzer = new RtpAnalyzer({
  onProblem: (problem) => {
    io.emit('rtp_problem', problem);
    if (problem.type === 'NAT_SUSPECTED') {
      io.emit('nat_detected', problem);
    }
  },
  onMetric: (metric) => {
    io.emit('call_event', { type: 'RTP_METRIC', ts: Date.now(), ...metric });
  },
});

io.on('connection', (socket) => {
  socket.emit('call_event', {
    type: 'SERVER_INFO',
    ts: Date.now(),
    message: 'Connected to VoIP Monitoring Platform',
  });

  socket.on('request_snapshot', () => {
    socket.emit('call_event', {
      type: 'SNAPSHOT',
      ts: Date.now(),
      calls: Array.from(state.calls.values()),
    });
  });
});

app.get('/calls', (req, res) => {
  res.json({
    activeCalls: Array.from(state.calls.values()),
    count: state.calls.size,
  });
});

app.post('/call', async (req, res) => {
  const {
    from = '1000',
    to = '1001',
    scenario = 'normal',
    durationMs = 12000,
  } = req.body || {};

  const call = createCall({ from, to, scenario, durationMs });
  state.calls.set(call.id, call.toJSON());

  const updateCall = (patch) => {
    const existing = state.calls.get(call.id) || { id: call.id };
    const updated = { ...existing, ...patch };
    state.calls.set(call.id, updated);
  };

  call.on('sip', (msg) => {
    io.emit('call_event', { type: 'SIP', callId: call.id, ts: Date.now(), ...msg });
    if (msg.status) updateCall({ status: msg.status });
  });

  call.on('status', (status) => {
    updateCall({ status });
    io.emit('call_event', { type: 'CALL_STATUS', callId: call.id, ts: Date.now(), status });
  });

  call.on('rtpStart', (rtpConfig) => {
    updateCall({ rtp: rtpConfig });
    io.emit('call_event', { type: 'RTP_START', callId: call.id, ts: Date.now(), ...rtpConfig });
    rtpAnalyzer.startCall(call.id, rtpConfig);
  });

  call.on('end', (reason) => {
    io.emit('call_event', { type: 'CALL_END', callId: call.id, ts: Date.now(), reason });
    rtpAnalyzer.stopCall(call.id);
    state.calls.delete(call.id);
  });

  call.start();

  res.json({
    ok: true,
    call: call.toJSON(),
  });
});

app.get('/pcap/analyze', async (req, res) => {
  const filePath = path.join(__dirname, 'pcap', 'traffic_log.txt');
  try {
    const analysis = await parseSipLogFile(filePath);
    io.emit('call_event', { type: 'PCAP_ANALYSIS', ts: Date.now(), analysis });
    res.json({ ok: true, analysis });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

let lastCpuUsage = process.cpuUsage();
let lastCpuTime = Date.now();

app.get('/system/stats', (req, res) => {
  const now = Date.now();
  const usage = process.cpuUsage();
  const deltaUsage = {
    user: usage.user - lastCpuUsage.user,
    system: usage.system - lastCpuUsage.system,
  };
  const deltaMs = Math.max(1, now - lastCpuTime);

  lastCpuUsage = usage;
  lastCpuTime = now;

  const cpuPercent = ((deltaUsage.user + deltaUsage.system) / 1000) / (deltaMs * os.cpus().length) * 100;

  const mem = process.memoryUsage();

  res.json({
    cpu: {
      percent: Number(cpuPercent.toFixed(2)),
      cores: os.cpus().length,
      loadavg: os.loadavg(),
    },
    memory: {
      rss: mem.rss,
      heapTotal: mem.heapTotal,
      heapUsed: mem.heapUsed,
      external: mem.external,
    },
    calls: {
      active: state.calls.size,
    },
    uptimeSec: Math.floor(process.uptime()),
  });
});

startEventSimulator({
  io,
  intervalMs: 2500,
});

rtpAnalyzer.start();

// Initialize database and start server
async function startServer() {
  try {
    console.log('🔧 Initializing database...');
    dbInitialized = await initDatabase();
    
    if (dbInitialized) {
      console.log('✅ Database initialized successfully');
    } else {
      console.log('⚠️  Database not available, using fallback mode');
    }
    
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`🚀 VoIP Monitoring Platform listening on http://localhost:${PORT}`);
      console.log(`📊 Database: ${dbInitialized ? 'MySQL' : 'Fallback mode'}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
