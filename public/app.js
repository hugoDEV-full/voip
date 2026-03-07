const socket = (typeof window !== 'undefined' && typeof window.io === 'function') ? io() : null;

const elCalls = document.getElementById('calls');
const elEvents = document.getElementById('events');
const elNotifications = document.getElementById('notifications');

const elActiveCallsCount = document.getElementById('activeCallsCount');
const elProblemsCount = document.getElementById('problemsCount');
const elNotificationsCount = document.getElementById('notificationsCount');
const elConnBadge = document.getElementById('connBadge');

const elMemUsage = document.getElementById('memUsage');
const elMemBar = document.getElementById('memBar');
const elUptime = document.getElementById('uptime');
const elLastUpdate = document.getElementById('lastUpdate');

const btnToggleRunning = document.getElementById('btnToggleRunning');
const btnToggleAutoResolve = document.getElementById('btnToggleAutoResolve');
const btnClearEvents = document.getElementById('btnClearEvents');

const state = {
  calls: new Map(),
  events: [],
  notifications: [],
  autoResolve: true,
  running: true,
};

function fmtTs(ts) {
  const n = Number(ts);
  if (!Number.isFinite(n)) return '--:--:--';
  try { return new Date(n).toLocaleTimeString(); } catch { return '--:--:--'; }
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function problemsForCall(call) {
  const p = call?.problems || {};
  const items = [];
  if (p.oneWay?.active) items.push('ONE_WAY');
  if (p.latency?.active) items.push('LATENCY');
  if (p.dropped?.active) items.push('DROPPED');
  return items;
}

function calcProblemsCount() {
  let c = 0;
  for (const call of state.calls.values()) c += problemsForCall(call).length;
  return c;
}

function badgeForStatus(status) {
  if (status === 'ACTIVE') return 'text-bg-success';
  if (status === 'DROPPED') return 'text-bg-danger';
  return 'text-bg-secondary';
}

function renderCalls() {
  if (!elCalls) return;
  const calls = Array.from(state.calls.values());
  calls.sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));

  elCalls.innerHTML = calls.map((c) => {
    const m = c.metrics || {};
    const problems = problemsForCall(c);
    const problemsHtml = problems.length
      ? problems.map(p => `<span class="badge text-bg-danger me-1">${p}</span>`).join('')
      : `<span class="badge text-bg-success">OK</span>`;

    const actions = problems.length
      ? problems.map((p) => {
          const label = p === 'ONE_WAY' ? 'Resolver one-way' : p === 'LATENCY' ? 'Resolver latência' : 'Recuperar call';
          return `<button class="btn btn-sm btn-outline-primary ms-1" data-action="resolve" data-call-id="${escapeHtml(c.id)}" data-kind="${p}">${label}</button>`;
        }).join('')
      : `<span class="text-muted">—</span>`;

    return `
      <tr>
        <td class="mono">${escapeHtml(c.id)}</td>
        <td>${escapeHtml(c.from)}</td>
        <td>${escapeHtml(c.to)}</td>
        <td><span class="badge ${badgeForStatus(c.status)}">${escapeHtml(c.status)}</span></td>
        <td>${Math.round(Number(m.latencyMs || 0))}ms</td>
        <td>${Number(m.packetLossPct || 0).toFixed(1)}%</td>
        <td>${Number(m.mos || 0).toFixed(2)}</td>
        <td>${problemsHtml}</td>
        <td class="text-end">${actions}</td>
      </tr>
    `;
  }).join('');

  if (elActiveCallsCount) elActiveCallsCount.textContent = String(state.calls.size);
  if (elProblemsCount) elProblemsCount.textContent = String(calcProblemsCount());
}

function renderEvents() {
  if (!elEvents) return;
  const items = state.events.slice(0, 60);
  elEvents.innerHTML = items.map((e) => `
    <div class="feed-item">
      <div><span class="text-muted">[${fmtTs(e.ts)}]</span> <strong>${escapeHtml(e.type)}</strong>${e.callId ? ` <span class="text-muted">(${escapeHtml(e.callId)})</span>` : ''}</div>
      <div class="text-muted">${escapeHtml(e.message || '')}</div>
    </div>
  `).join('');
}

function renderNotifications() {
  if (!elNotifications) return;
  const items = state.notifications.slice(0, 30);
  elNotifications.innerHTML = items.map((n) => {
    const level = n.level || 'secondary';
    return `
      <div class="feed-item">
        <div class="d-flex justify-content-between">
          <strong class="text-${escapeHtml(level)}">${escapeHtml(n.title || 'Notificação')}</strong>
          <span class="text-muted">${fmtTs(n.ts)}</span>
        </div>
        <div>${escapeHtml(n.message || '')}</div>
        ${n.callId ? `<div class="text-muted small mono">Call: ${escapeHtml(n.callId)}</div>` : ''}
      </div>
    `;
  }).join('');

  if (elNotificationsCount) elNotificationsCount.textContent = String(state.notifications.length);
}

function updateToggleButtons() {
  if (btnToggleRunning) {
    btnToggleRunning.innerHTML = state.running
      ? '<i class="bi bi-pause-fill"></i> <span>Simulação: ON</span>'
      : '<i class="bi bi-play-fill"></i> <span>Simulação: OFF</span>';
  }
  if (btnToggleAutoResolve) {
    btnToggleAutoResolve.innerHTML = state.autoResolve
      ? '<i class="bi bi-robot"></i> <span>Auto-resolução: ON</span>'
      : '<i class="bi bi-robot"></i> <span>Auto-resolução: OFF</span>';
  }
}

function bindCallActions() {
  if (!elCalls) return;
  elCalls.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action="resolve"]');
    if (!btn || !socket) return;
    const callId = btn.getAttribute('data-call-id');
    const kind = btn.getAttribute('data-kind');
    socket.emit('resolve', { callId, kind });
  });
}

async function refreshStats() {
  try {
    const res = await fetch('/api/system/stats');
    const data = await res.json();
    const mem = data?.memory;

    const heapUsed = Number(mem?.heapUsed || 0);
    const heapTotal = Number(mem?.heapTotal || 0);
    const pct = heapTotal > 0 ? Math.max(0, Math.min(100, (heapUsed / heapTotal) * 100)) : 0;

    if (elMemUsage) elMemUsage.textContent = pct.toFixed(0) + '%';
    if (elMemBar) elMemBar.style.width = pct + '%';

    if (elUptime) {
      const u = Number(data?.uptimeSec || 0);
      const h = Math.floor(u / 3600);
      const m = Math.floor((u % 3600) / 60);
      const s = Math.floor(u % 60);
      elUptime.textContent = `${h}h ${m}m ${s}s`;
    }

    if (elLastUpdate) elLastUpdate.textContent = new Date().toLocaleTimeString();
  } catch {
    // ignore
  }
}

function onSnapshot(snap) {
  state.calls.clear();
  for (const c of (snap.calls || [])) if (c?.id) state.calls.set(c.id, c);
  state.events = Array.isArray(snap.events) ? snap.events : [];
  state.notifications = Array.isArray(snap.notifications) ? snap.notifications : [];
  state.autoResolve = Boolean(snap.autoResolve);
  state.running = Boolean(snap.running);

  updateToggleButtons();
  renderCalls();
  renderEvents();
  renderNotifications();
}

if (btnToggleRunning) {
  btnToggleRunning.addEventListener('click', () => {
    state.running = !state.running;
    updateToggleButtons();
    if (socket) socket.emit('toggle_running', state.running);
  });
}

if (btnToggleAutoResolve) {
  btnToggleAutoResolve.addEventListener('click', () => {
    state.autoResolve = !state.autoResolve;
    updateToggleButtons();
    if (socket) socket.emit('toggle_auto_resolve', state.autoResolve);
  });
}

if (btnClearEvents) {
  btnClearEvents.addEventListener('click', () => {
    state.events = [];
    renderEvents();
  });
}

if (socket) {
  socket.on('connect', () => {
    if (elConnBadge) {
      elConnBadge.textContent = 'Online';
      elConnBadge.className = 'badge text-bg-success';
    }
  });

  socket.on('disconnect', () => {
    if (elConnBadge) {
      elConnBadge.textContent = 'Offline';
      elConnBadge.className = 'badge text-bg-danger';
    }
  });

  socket.on('snapshot', (snap) => onSnapshot(snap));
  socket.on('event', (ev) => { state.events.unshift(ev); state.events = state.events.slice(0, 200); renderEvents(); });
  socket.on('notification', (n) => { state.notifications.unshift(n); state.notifications = state.notifications.slice(0, 100); renderNotifications(); });

  socket.on('call_update', ({ call }) => {
    if (!call?.id) return;
    state.calls.set(call.id, call);
    renderCalls();
  });

  socket.on('call_remove', ({ callId }) => {
    if (!callId) return;
    state.calls.delete(callId);
    renderCalls();
  });

  socket.on('metric', (m) => {
    const call = state.calls.get(m.callId);
    if (!call) return;
    call.metrics = m.metrics;
    call.status = m.status;
    call.problems = m.problems;
    call.scenario = m.scenario;
    call.updatedAt = m.ts;
    state.calls.set(call.id, call);
    renderCalls();
  });
}

bindCallActions();
updateToggleButtons();
setInterval(refreshStats, 1500);
refreshStats();
