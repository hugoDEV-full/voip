class RtpAnalyzer {
  constructor({ onProblem, onMetric }) {
    this.onProblem = typeof onProblem === 'function' ? onProblem : () => {};
    this.onMetric = typeof onMetric === 'function' ? onMetric : () => {};

    this.calls = new Map();
    this._timer = null;
  }

  start() {
    if (this._timer) return;
    this._timer = setInterval(() => this._tick(), 1000);
  }

  stop() {
    if (this._timer) clearInterval(this._timer);
    this._timer = null;
  }

  startCall(callId, rtpConfig) {
    const now = Date.now();
    const expectedPps = Number(rtpConfig.expectedPps || 50);
    const streams = Array.isArray(rtpConfig.streams) ? rtpConfig.streams : [];

    const streamState = new Map();
    for (const s of streams) {
      streamState.set(s.id, {
        ...s,
        expectedPps,
        lastPacketsReceived: 0,
        lastLatencyMs: s.baseLatencyMs || 60,
        lastTickTs: now,
        oneWayAlerted: false,
        natAlerted: false,
        latencyAlerted: false,
      });
    }

    this.calls.set(callId, {
      callId,
      startedAt: now,
      expectedPps,
      streams: streamState,
    });
  }

  stopCall(callId) {
    this.calls.delete(callId);
  }

  _tick() {
    const now = Date.now();

    for (const call of this.calls.values()) {
      for (const stream of call.streams.values()) {
        const expected = stream.expectedPps;

        // simulate received packets + latency
        // if receiveEnabled=false, this creates a one-way condition
        let received;
        if (!stream.receiveEnabled) {
          received = 0;
        } else {
          const jitterLoss = Math.random() < 0.08 ? Math.floor(expected * (0.3 + Math.random() * 0.4)) : 0;
          received = Math.max(0, expected - jitterLoss);
        }

        const latencyVariance = (Math.random() * 30) - 10;
        const latencyMs = Math.max(10, Math.round((stream.baseLatencyMs || 60) + latencyVariance));

        stream.lastPacketsReceived = received;
        stream.lastLatencyMs = latencyMs;
        stream.lastTickTs = now;

        this.onMetric({
          callId: call.callId,
          streamId: stream.id,
          direction: stream.direction,
          expected,
          received,
          latencyMs,
        });

        // rule: one-way or severe packet deficit
        if (received < expected * 0.2 && !stream.oneWayAlerted) {
          stream.oneWayAlerted = true;

          this.onProblem({
            type: 'ONE_WAY_AUDIO',
            severity: 'ALERT',
            ts: now,
            callId: call.callId,
            streamId: stream.id,
            direction: stream.direction,
            message: 'RTP flow broken',
            details: {
              expected,
              received,
              diagnosis: 'Possible NAT misconfiguration',
            },
          });

          if (!stream.natAlerted) {
            stream.natAlerted = true;
            this.onProblem({
              type: 'NAT_SUSPECTED',
              severity: 'WARN',
              ts: now,
              callId: call.callId,
              streamId: stream.id,
              direction: stream.direction,
              message: 'Possible NAT or Firewall issue',
              details: {
                expected,
                received,
                hint: 'Check SDP c= address, rport/received, symmetric RTP, and firewall pinholes',
              },
            });
          }
        }

        // rule: latency
        if (latencyMs > 150 && !stream.latencyAlerted) {
          stream.latencyAlerted = true;
          this.onProblem({
            type: 'HIGH_LATENCY',
            severity: 'WARN',
            ts: now,
            callId: call.callId,
            streamId: stream.id,
            direction: stream.direction,
            message: 'High latency detected',
            details: {
              latencyMs,
              thresholdMs: 150,
              hint: 'Possible WAN congestion, bufferbloat, or routing asymmetry',
            },
          });
        }
      }
    }
  }
}

module.exports = {
  RtpAnalyzer,
};
