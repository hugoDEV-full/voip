function startEventSimulator({ io, intervalMs = 2000 }) {
  if (!io) throw new Error('io is required');

  const events = ['CHANNEL_CREATE', 'CHANNEL_ANSWER', 'CHANNEL_HANGUP'];
  let idx = 0;

  setInterval(() => {
    const ev = events[idx % events.length];
    idx += 1;

    io.emit('call_event', {
      type: 'ESL_EVENT',
      ts: Date.now(),
      event: ev,
      headers: {
        'Event-Name': ev,
        'Caller-Caller-ID-Number': '1000',
        'Caller-Destination-Number': '1001',
        'Unique-ID': 'SIM-' + String(Date.now()),
      },
    });
  }, intervalMs);
}

module.exports = {
  startEventSimulator,
};
