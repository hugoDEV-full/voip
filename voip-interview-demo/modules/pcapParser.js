const fs = require('fs/promises');

function analyzeLines(lines) {
  const events = [];
  const warnings = [];
  const sip = [];

  let sawInvite = false;
  let saw200 = false;
  let rtpAB = false;
  let rtpBA = false;
  let rtpLostB = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    events.push(line);

    if (line.startsWith('INVITE')) {
      sawInvite = true;
      sip.push(line);
    } else if (line.includes('200 OK')) {
      saw200 = true;
      sip.push(line);
    } else if (line.startsWith('100') || line.startsWith('180') || line.startsWith('ACK')) {
      sip.push(line);
    }

    if (line === 'RTP START A->B') rtpAB = true;
    if (line === 'RTP START B->A') rtpBA = true;
    if (line === 'RTP LOST B') rtpLostB = true;
  }

  if (!sawInvite) warnings.push('Missing INVITE in log');
  if (sawInvite && !saw200) warnings.push('Call did not reach 200 OK (no answer)');

  const diagnosis = [];

  if (rtpAB && !rtpBA) {
    diagnosis.push({
      problem: 'Possible One-Way Audio',
      cause: 'RTP present A->B but missing B->A',
      suggestion: 'Check NAT, SDP advertised IP/port, and firewall rules',
    });
  }

  if (rtpLostB) {
    diagnosis.push({
      problem: 'RTP Packet Loss',
      cause: 'Receiver B reports loss',
      suggestion: 'Check jitter, congestion, or incorrect NAT mapping for B',
    });
  }

  if (diagnosis.length === 0) {
    diagnosis.push({
      problem: 'No critical issues detected',
      cause: 'SIP/RTP markers look normal in this simplified log',
      suggestion: 'Correlate with real PCAP in Wireshark/sngrep for deeper analysis',
    });
  }

  return {
    summary: {
      sip: { sawInvite, saw200 },
      rtp: { rtpAB, rtpBA, rtpLostB },
      warningsCount: warnings.length,
      diagnosisCount: diagnosis.length,
    },
    sipMessages: sip,
    rawEvents: events,
    warnings,
    diagnosis,
  };
}

async function parseSipLogFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  return analyzeLines(lines);
}

module.exports = {
  parseSipLogFile,
};
