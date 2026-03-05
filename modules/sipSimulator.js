const { EventEmitter } = require('events');
const { v4: uuidv4 } = require('uuid');

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildSdp({
  originIp,
  connectionIp,
  rtpPort,
  codec = 'PCMU/8000',
}) {
  return [
    'v=0',
    `o=- 0 0 IN IP4 ${originIp}`,
    's=-',
    `c=IN IP4 ${connectionIp}`,
    't=0 0',
    `m=audio ${rtpPort} RTP/AVP 0`,
    `a=rtpmap:0 ${codec}`,
    'a=sendrecv',
  ].join('\r\n');
}

function buildSipMessage({
  startLine,
  headers,
  body,
}) {
  const hdr = Object.entries(headers)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\r\n');

  const hasBody = typeof body === 'string' && body.length > 0;
  const contentLength = hasBody ? Buffer.byteLength(body, 'utf8') : 0;
  const withLen = `${hdr}\r\nContent-Length: ${contentLength}`;

  if (!hasBody) return `${startLine}\r\n${withLen}\r\n\r\n`;
  return `${startLine}\r\n${withLen}\r\n\r\n${body}`;
}

class CallSession extends EventEmitter {
  constructor({ from, to, scenario, durationMs }) {
    super();
    this.id = uuidv4();
    this.from = String(from);
    this.to = String(to);
    this.scenario = scenario;
    this.durationMs = durationMs;
    this.status = 'IDLE';
    this.startedAt = null;
  }

  toJSON() {
    return {
      id: this.id,
      from: this.from,
      to: this.to,
      scenario: this.scenario,
      durationMs: this.durationMs,
      status: this.status,
      startedAt: this.startedAt,
    };
  }

  async start() {
    this.startedAt = Date.now();
    this._setStatus('CALLING');

    const callId = `${this.id}@demo.local`;
    const branch = `z9hG4bK-${this.id.slice(0, 8)}`;
    const tagA = this.id.slice(0, 6);
    const tagB = this.id.slice(6, 12);
    const localIpA = '10.0.0.10';
    const publicIpA = '198.51.100.10';
    const localIpB = '10.0.1.20';
    const publicIpB = '203.0.113.20';

    const natWrong = this.scenario === 'nat_wrong';
    const sdpIpA = natWrong ? localIpA : publicIpA;
    const sdpIpB = publicIpB;
    const rtpPortA = 40000 + Math.floor(Math.random() * 1000);
    const rtpPortB = 50000 + Math.floor(Math.random() * 1000);

    const inviteSdp = buildSdp({
      originIp: sdpIpA,
      connectionIp: sdpIpA,
      rtpPort: rtpPortA,
    });

    const invite = buildSipMessage({
      startLine: `INVITE sip:${this.to}@demo.local SIP/2.0`,
      headers: {
        Via: `SIP/2.0/UDP ${publicIpA}:5060;branch=${branch};rport`,
        'Max-Forwards': '70',
        From: `\"${this.from}\" <sip:${this.from}@demo.local>;tag=${tagA}`,
        To: `<sip:${this.to}@demo.local>`,
        'Call-ID': callId,
        CSeq: '1 INVITE',
        Contact: `<sip:${this.from}@${publicIpA}:5060>`,
        'Content-Type': 'application/sdp',
      },
      body: inviteSdp,
    });

    this.emit('sip', { direction: 'A->B', message: invite, status: 'INVITE' });
    await wait(300);

    const trying = buildSipMessage({
      startLine: 'SIP/2.0 100 Trying',
      headers: {
        Via: `SIP/2.0/UDP ${publicIpA}:5060;branch=${branch};received=${publicIpA};rport=5060`,
        From: `\"${this.from}\" <sip:${this.from}@demo.local>;tag=${tagA}`,
        To: `<sip:${this.to}@demo.local>`,
        'Call-ID': callId,
        CSeq: '1 INVITE',
      },
      body: '',
    });

    this.emit('sip', { direction: 'B->A', message: trying, status: 'TRYING' });
    await wait(400);

    const ringing = buildSipMessage({
      startLine: 'SIP/2.0 180 Ringing',
      headers: {
        Via: `SIP/2.0/UDP ${publicIpA}:5060;branch=${branch};received=${publicIpA};rport=5060`,
        From: `\"${this.from}\" <sip:${this.from}@demo.local>;tag=${tagA}`,
        To: `<sip:${this.to}@demo.local>;tag=${tagB}`,
        'Call-ID': callId,
        CSeq: '1 INVITE',
        Contact: `<sip:${this.to}@${publicIpB}:5060>`,
      },
      body: '',
    });

    this.emit('sip', { direction: 'B->A', message: ringing, status: 'RINGING' });
    await wait(700);

    const okSdp = buildSdp({
      originIp: sdpIpB,
      connectionIp: sdpIpB,
      rtpPort: rtpPortB,
    });

    const ok = buildSipMessage({
      startLine: 'SIP/2.0 200 OK',
      headers: {
        Via: `SIP/2.0/UDP ${publicIpA}:5060;branch=${branch};received=${publicIpA};rport=5060`,
        From: `\"${this.from}\" <sip:${this.from}@demo.local>;tag=${tagA}`,
        To: `<sip:${this.to}@demo.local>;tag=${tagB}`,
        'Call-ID': callId,
        CSeq: '1 INVITE',
        Contact: `<sip:${this.to}@${publicIpB}:5060>`,
        'Content-Type': 'application/sdp',
      },
      body: okSdp,
    });

    this.emit('sip', { direction: 'B->A', message: ok, status: 'ANSWERED' });
    await wait(150);

    const ack = buildSipMessage({
      startLine: `ACK sip:${this.to}@demo.local SIP/2.0`,
      headers: {
        Via: `SIP/2.0/UDP ${publicIpA}:5060;branch=z9hG4bK-${this.id.slice(0, 8)}-ack;rport`,
        'Max-Forwards': '70',
        From: `\"${this.from}\" <sip:${this.from}@demo.local>;tag=${tagA}`,
        To: `<sip:${this.to}@demo.local>;tag=${tagB}`,
        'Call-ID': callId,
        CSeq: '1 ACK',
        Contact: `<sip:${this.from}@${publicIpA}:5060>`,
      },
      body: '',
    });

    this.emit('sip', { direction: 'A->B', message: ack, status: 'IN_CALL' });
    this._setStatus('IN_CALL');

    const oneWayAudio = this.scenario === 'one_way_audio';
    // natWrong already computed above

    this.emit('rtpStart', {
      expectedPps: 50,
      streams: [
        {
          id: 'A_TO_B',
          from: 'A',
          to: 'B',
          direction: 'A->B',
          receiveEnabled: !(oneWayAudio || natWrong),
          baseLatencyMs: natWrong ? 220 : 60,
        },
        {
          id: 'B_TO_A',
          from: 'B',
          to: 'A',
          direction: 'B->A',
          receiveEnabled: true,
          baseLatencyMs: natWrong ? 220 : 60,
        },
      ],
      sdp: {
        a: { advertisedIp: sdpIpA, rtpPort: rtpPortA, publicIp: publicIpA, privateIp: localIpA },
        b: { advertisedIp: sdpIpB, rtpPort: rtpPortB, publicIp: publicIpB, privateIp: localIpB },
        note: natWrong
          ? 'SDP from A is advertising a private IP (classic NAT misconfiguration).'
          : 'SDP advertising public IPs (expected).',
      },
    });

    await wait(this.durationMs);
    this._setStatus('HANGUP');
    this.emit('end', 'NORMAL_CLEARING');
  }

  _setStatus(status) {
    this.status = status;
    this.emit('status', status);
  }
}

function createCall(opts) {
  return new CallSession(opts);
}

module.exports = {
  createCall,
};
