// VoIP Monitor Dashboard - Sistema de Simulação Completo
// Todas as funcionalidades são simuladas para demonstração

class VoIPMonitor {
  constructor() {
    this.calls = new Map();
    this.events = [];
    this.alerts = [];
    this.stats = {
      activeCalls: 0,
      alertCount: 0,
      eventCount: 0,
      cpuUsage: 0
    };
    this.autoResolveEnabled = false;
    this.callIdCounter = 1000;
    this.eventIdCounter = 1;
    
    this.init();
  }

  init() {
    this.updateTime();
    this.updateSystemStats();
    this.startBackgroundSimulation();
    
    // Atualizar tempo a cada segundo
    setInterval(() => this.updateTime(), 1000);
    
    // Atualizar stats a cada 3 segundos
    setInterval(() => this.updateSystemStats(), 3000);
    
    console.log('VoIP Monitor Dashboard iniciado');
  }

  updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR');
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
      timeElement.textContent = timeString;
    }
  }

  updateSystemStats() {
    // Simular variação de CPU
    this.stats.cpuUsage = Math.floor(Math.random() * 30) + 10;
    
    // Atualizar UI
    this.updateMetrics();
  }

  updateMetrics() {
    document.getElementById('activeCalls').textContent = this.stats.activeCalls;
    document.getElementById('alertCount').textContent = this.stats.alertCount;
    document.getElementById('eventCount').textContent = this.stats.eventCount;
    document.getElementById('cpuUsage').textContent = this.stats.cpuUsage + '%';
    document.getElementById('callsBadge').textContent = this.stats.activeCalls;
    document.getElementById('alertsBadge').textContent = this.stats.alertCount;
  }

  // Funções de Simulação
  simulateNormalCall() {
    const callId = this.callIdCounter++;
    const from = `+55${Math.floor(Math.random() * 90000000) + 10000000}`;
    const to = `+55${Math.floor(Math.random() * 90000000) + 10000000}`;
    
    const call = {
      id: callId,
      from: from,
      to: to,
      status: 'Ativa',
      quality: 'Excelente',
      startTime: new Date(),
      duration: 0,
      latency: Math.floor(Math.random() * 50) + 10,
      packetLoss: Math.floor(Math.random() * 2),
      mos: (Math.random() * 0.5 + 4.0).toFixed(1)
    };

    this.calls.set(callId, call);
    this.stats.activeCalls++;
    
    this.addEvent(`CALL_START`, `Chamada ${callId}: ${from} -> ${to} iniciada`);
    this.showToast('Chamada Normal', `Chamada ${callId} iniciada com sucesso`, 'success');
    
    this.updateCallsTable();
    this.updateMetrics();
    
    // Simular término da chamada após algum tempo
    setTimeout(() => {
      this.endCall(callId);
    }, Math.random() * 10000 + 5000);
  }

  simulateOneWayAudio() {
    const callId = this.callIdCounter++;
    const from = `+55${Math.floor(Math.random() * 90000000) + 10000000}`;
    const to = `+55${Math.floor(Math.random() * 90000000) + 10000000}`;
    
    const call = {
      id: callId,
      from: from,
      to: to,
      status: 'Problema',
      quality: 'Ruim',
      startTime: new Date(),
      duration: 0,
      latency: Math.floor(Math.random() * 100) + 50,
      packetLoss: Math.floor(Math.random() * 10) + 5,
      mos: (Math.random() * 1.5 + 2.0).toFixed(1),
      issue: 'One-Way Audio'
    };

    this.calls.set(callId, call);
    this.stats.activeCalls++;
    this.stats.alertCount++;
    
    this.addEvent('AUDIO_PROBLEM', `One-Way Audio detectado na chamada ${callId}`);
    this.addAlert('warning', `One-Way Audio`, `Chamada ${callId} com áudio em uma direção apenas`);
    this.showToast('One-Way Audio', `Problema detectado na chamada ${callId}`, 'warning');
    
    this.updateCallsTable();
    this.updateMetrics();
    this.updateAlerts();
    
    if (this.autoResolveEnabled) {
      setTimeout(() => {
        this.resolveOneWayAudio(callId);
      }, 3000);
    }
    
    setTimeout(() => {
      this.endCall(callId);
    }, Math.random() * 8000 + 4000);
  }

  simulateNatProblem() {
    const callId = this.callIdCounter++;
    const from = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    const to = `+55${Math.floor(Math.random() * 90000000) + 10000000}`;
    
    const call = {
      id: callId,
      from: from,
      to: to,
      status: 'NAT',
      quality: 'Péssima',
      startTime: new Date(),
      duration: 0,
      latency: Math.floor(Math.random() * 200) + 100,
      packetLoss: Math.floor(Math.random() * 20) + 10,
      mos: (Math.random() * 1.0 + 1.0).toFixed(1),
      issue: 'NAT Problem'
    };

    this.calls.set(callId, call);
    this.stats.activeCalls++;
    this.stats.alertCount++;
    
    this.addEvent('NAT_DETECTED', `IP privado detectado: ${from} na chamada ${callId}`);
    this.addAlert('danger', `Problema NAT`, `IP privado ${from} detectado na chamada ${callId}`);
    this.showToast('Problema NAT', `IP privado detectado na chamada ${callId}`, 'danger');
    
    this.updateCallsTable();
    this.updateMetrics();
    this.updateAlerts();
    
    if (this.autoResolveEnabled) {
      setTimeout(() => {
        this.resolveNatProblem(callId);
      }, 5000);
    }
    
    setTimeout(() => {
      this.endCall(callId);
    }, Math.random() * 6000 + 3000);
  }

  simulateTrafficAnalysis() {
    this.addEvent('ANALYSIS_START', 'Iniciando análise de tráfego SIP/RTP...');
    this.showToast('Análise de Tráfego', 'Análise iniciada', 'info');
    
    // Simular múltiplos eventos de análise
    const analysisEvents = [
      'SIP: 200 OK recebido',
      'RTP: Stream de áudio estabelecido',
      'CODEC: G.711 detectado',
      'BANDWIDTH: 64 kbps utilizados',
      'JITTER: 2ms (normal)',
      'PACKET_LOSS: 0.5% (aceitável)'
    ];
    
    analysisEvents.forEach((event, index) => {
      setTimeout(() => {
        this.addEvent('ANALYSIS', event);
      }, (index + 1) * 800);
    });
    
    setTimeout(() => {
      this.addEvent('ANALYSIS_COMPLETE', 'Análise de tráfego concluída - Sistema normal');
      this.showToast('Análise Concluída', 'Tráfego normal, sem problemas detectados', 'success');
    }, analysisEvents.length * 800 + 1000);
  }

  // Funções de Resolução
  resolveOneWayAudio(callId) {
    const call = this.calls.get(callId);
    if (call && call.issue === 'One-Way Audio') {
      call.issue = 'Resolvido';
      call.quality = 'Bom';
      call.status = 'Recuperada';
      this.stats.alertCount--;
      
      this.addEvent('AUTO_RESOLVE', `One-Way Audio resolvido automaticamente na chamada ${callId}`);
      this.showToast('Auto-Resolução', `Problema de áudio resolvido na chamada ${callId}`, 'success');
      
      this.updateCallsTable();
      this.updateMetrics();
      this.updateAlerts();
    }
  }

  resolveNatProblem(callId) {
    const call = this.calls.get(callId);
    if (call && call.issue === 'NAT Problem') {
      call.issue = 'NAT Configurado';
      call.quality = 'Regular';
      call.status = 'Recuperada';
      this.stats.alertCount--;
      
      this.addEvent('AUTO_RESOLVE', `NAT configurado automaticamente para chamada ${callId}`);
      this.showToast('Auto-Resolução', `Problema NAT resolvido na chamada ${callId}`, 'success');
      
      this.updateCallsTable();
      this.updateMetrics();
      this.updateAlerts();
    }
  }

  // Funções de Interface
  updateCallsTable() {
    const tbody = document.getElementById('callsTable');
    if (!tbody) return;
    
    if (this.calls.size === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Nenhuma chamada ativa</td></tr>';
      return;
    }
    
    tbody.innerHTML = '';
    
    this.calls.forEach(call => {
      const row = document.createElement('tr');
      
      let statusClass = 'text-success';
      if (call.status === 'Problema' || call.status === 'NAT') {
        statusClass = 'text-danger';
      } else if (call.status === 'Recuperada') {
        statusClass = 'text-warning';
      }
      
      let qualityClass = 'text-success';
      if (call.quality === 'Ruim' || call.quality === 'Péssima') {
        qualityClass = 'text-danger';
      } else if (call.quality === 'Regular' || call.quality === 'Bom') {
        qualityClass = 'text-warning';
      }
      
      row.innerHTML = `
        <td>${call.id}</td>
        <td>${call.from}</td>
        <td>${call.to}</td>
        <td class="${statusClass}">${call.status}${call.issue ? ' (' + call.issue + ')' : ''}</td>
        <td class="${qualityClass}">MOS: ${call.mos}</td>
      `;
      
      tbody.appendChild(row);
    });
  }

  addEvent(type, message) {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    const event = {
      id: this.eventIdCounter++,
      type: type,
      message: message,
      timestamp: timestamp
    };
    
    this.events.unshift(event);
    if (this.events.length > 50) {
      this.events.pop();
    }
    
    this.stats.eventCount++;
    this.updateEventsFeed();
    this.updateMetrics();
  }

  updateEventsFeed() {
    const feed = document.getElementById('eventsFeed');
    if (!feed) return;
    
    if (this.events.length === 0) {
      feed.innerHTML = '<div class="text-muted text-center">Aguardando eventos...</div>';
      return;
    }
    
    feed.innerHTML = '';
    
    this.events.slice(0, 20).forEach(event => {
      const div = document.createElement('div');
      div.className = 'mb-1';
      
      let typeColor = 'text-secondary';
      if (event.type.includes('PROBLEM') || event.type.includes('NAT')) {
        typeColor = 'text-danger';
      } else if (event.type.includes('CALL_START') || event.type.includes('AUTO_RESOLVE')) {
        typeColor = 'text-success';
      } else if (event.type.includes('ANALYSIS')) {
        typeColor = 'text-info';
      }
      
      div.innerHTML = `<span class="text-muted">[${event.timestamp}]</span> <span class="${typeColor}">${event.type}:</span> ${event.message}`;
      feed.appendChild(div);
    });
  }

  addAlert(type, title, message) {
    const alert = {
      type: type,
      title: title,
      message: message,
      timestamp: new Date().toLocaleTimeString('pt-BR')
    };
    
    this.alerts.unshift(alert);
    if (this.alerts.length > 10) {
      this.alerts.pop();
    }
    
    this.updateAlerts();
  }

  updateAlerts() {
    const container = document.getElementById('alertsContainer');
    if (!container) return;
    
    if (this.alerts.length === 0) {
      container.innerHTML = `
        <div class="alert alert-info mb-0">
          <i class="bi bi-info-circle me-2"></i>
          Sistema funcionando normalmente. Nenhum alerta no momento.
        </div>
      `;
      return;
    }
    
    container.innerHTML = '';
    
    this.alerts.slice(0, 5).forEach(alert => {
      const div = document.createElement('div');
      div.className = `alert alert-${alert.type} alert-dismissible mb-2`;
      div.innerHTML = `
        <i class="bi bi-exclamation-triangle me-2"></i>
        <strong>${alert.title}:</strong> ${alert.message}
        <small class="text-muted d-block">${alert.timestamp}</small>
        <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
      `;
      container.appendChild(div);
    });
  }

  showToast(title, message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast show`;
    toast.setAttribute('role', 'alert');
    
    const bgClass = type === 'success' ? 'bg-success' : 
                   type === 'warning' ? 'bg-warning' : 
                   type === 'danger' ? 'bg-danger' : 'bg-info';
    
    toast.innerHTML = `
      <div class="toast-header ${bgClass} text-white">
        <i class="bi bi-info-circle me-2"></i>
        <strong class="me-auto">${title}</strong>
        <small>Agora</small>
        <button type="button" class="btn-close btn-close-white" onclick="this.parentElement.parentElement.remove()"></button>
      </div>
      <div class="toast-body">
        ${message}
      </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }

  endCall(callId) {
    const call = this.calls.get(callId);
    if (call) {
      this.calls.delete(callId);
      this.stats.activeCalls--;
      
      const duration = Math.floor((new Date() - call.startTime) / 1000);
      this.addEvent('CALL_END', `Chamada ${callId} finalizada - Duração: ${duration}s`);
      
      this.updateCallsTable();
      this.updateMetrics();
    }
  }

  // Funções de Controle
  toggleAutoResolve() {
    this.autoResolveEnabled = !this.autoResolveEnabled;
    const button = document.getElementById('autoResolveText');
    
    if (this.autoResolveEnabled) {
      button.textContent = 'Desativar Auto-Resolução';
      this.showToast('Auto-Resolução', 'Auto-resolução ATIVADA', 'success');
      this.addEvent('SYSTEM', 'Auto-resolução ativada');
    } else {
      button.textContent = 'Ativar Auto-Resolução';
      this.showToast('Auto-Resolução', 'Auto-resolução DESATIVADA', 'info');
      this.addEvent('SYSTEM', 'Auto-resolução desativada');
    }
  }

  clearAllData() {
    this.calls.clear();
    this.events = [];
    this.alerts = [];
    this.stats.activeCalls = 0;
    this.stats.alertCount = 0;
    this.stats.eventCount = 0;
    
    this.updateCallsTable();
    this.updateEventsFeed();
    this.updateAlerts();
    this.updateMetrics();
    
    this.showToast('Sistema', 'Todos os dados foram limpos', 'info');
    this.addEvent('SYSTEM', 'Todos os dados limpos pelo usuário');
  }

  clearEvents() {
    this.events = [];
    this.stats.eventCount = 0;
    this.updateEventsFeed();
    this.updateMetrics();
    this.showToast('Eventos', 'Eventos limpos', 'info');
  }

  showHelp() {
    this.showToast('Ajuda', 'Clique nos botões de simulação para testar o sistema', 'info');
  }

  resetSystem() {
    if (confirm('Tem certeza que deseja reiniciar o sistema?')) {
      location.reload();
    }
  }

  // Simulação em background
  startBackgroundSimulation() {
    // Simular eventos aleatórios a cada 15-30 segundos
    setInterval(() => {
      if (Math.random() < 0.3) {
        const events = [
          'SIP: Registrando usuário',
          'RTP: Pacote recebido',
          'SYSTEM: Verificando conexões',
          'MONITOR: Análise de qualidade em andamento'
        ];
        
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        this.addEvent('BACKGROUND', randomEvent);
      }
    }, Math.random() * 15000 + 15000);
  }
}

// Funções globais para onclick no HTML
let monitor;

function simulateNormalCall() {
  monitor.simulateNormalCall();
}

function simulateOneWayAudio() {
  monitor.simulateOneWayAudio();
}

function simulateNatProblem() {
  monitor.simulateNatProblem();
}

function simulateTrafficAnalysis() {
  monitor.simulateTrafficAnalysis();
}

function toggleAutoResolve() {
  monitor.toggleAutoResolve();
}

function clearAllData() {
  monitor.clearAllData();
}

function clearEvents() {
  monitor.clearEvents();
}

function showHelp() {
  monitor.showHelp();
}

function resetSystem() {
  monitor.resetSystem();
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  monitor = new VoIPMonitor();
});
