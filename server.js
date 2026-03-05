const path = require('path');
const http = require('http');
const os = require('os');

const express = require('express');
const { Server } = require('socket.io');

const { createCall } = require('./modules/sipSimulator');
const { RtpAnalyzer } = require('./modules/rtpAnalyzer');
const { parseSipLogFile } = require('./modules/pcapParser');
const { startEventSimulator } = require('./modules/eventSimulator');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Authentication middleware
function requireAuth(req, res, next) {
  const session = req.headers.cookie?.match(/voipSession=([^;]+)/);
  const sessionData = session ? decodeURIComponent(session[1]) : null;
  
  if (!sessionData) {
    // Check if requesting login page or static assets
    if (req.path === '/login.html' || req.path === '/login.js' || 
        req.path.startsWith('/node_modules/') || 
        req.path.endsWith('.css') || 
        req.path.endsWith('.js') && req.path !== '/login.js') {
      return next();
    }
    return res.redirect('/login.html');
  }
  
  try {
    const parsedSession = JSON.parse(sessionData);
    if (parsedSession.username) {
      return next();
    }
  } catch (e) {
    // Invalid session
  }
  
  res.redirect('/login.html');
}

// Apply auth middleware to all routes except login
app.use(requireAuth);

// Logout route
app.post('/logout', (req, res) => {
  res.clearCookie('voipSession');
  res.json({ success: true });
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  // intentionally no extra console noise beyond the essentials
  console.log(`VoIP Monitoring Platform listening on http://localhost:${PORT}`);
});
