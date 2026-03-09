// VoIP Monitor Dashboard - Sistema de Simulação Completo com Tradução
// Todas as funcionalidades são simuladas para demonstração

// Dicionário de Traduções
const translations = {
  pt: {
    online: 'Online',
    demoUser: 'Demo User',
    help: 'Ajuda',
    resetSystem: 'Reiniciar Sistema',
    activeCalls: 'Chamadas Ativas',
    alerts: 'Alertas',
    events: 'Eventos',
    cpu: 'CPU',
    controlPanel: 'Painel de Controle',
    normalCall: 'Chamada Normal',
    normalCallDesc: 'Simular chamada sem problemas',
    oneWayAudio: 'One-Way Audio',
    oneWayAudioDesc: 'Áudio só em uma direção',
    natProblem: 'Problema NAT',
    natProblemDesc: 'IP privado detectado',
    trafficAnalysis: 'Analisar Tráfego',
    trafficAnalysisDesc: 'Análise SIP/RTP',
    activateAutoResolve: 'Ativar Auto-Resolução',
    deactivateAutoResolve: 'Desativar Auto-Resolução',
    clearAllData: 'Limpar Todos os Dados',
    activeCallsTitle: 'Chamadas Ativas',
    realTimeEvents: 'Eventos em Tempo Real',
    systemAlerts: 'Alertas do Sistema',
    tableId: 'ID',
    tableFrom: 'De',
    tableTo: 'Para',
    tableStatus: 'Status',
    tableQuality: 'Qualidade',
    noActiveCalls: 'Nenhuma chamada ativa',
    waitingEvents: 'Aguardando eventos...',
    systemNormal: 'Sistema funcionando normalmente. Nenhum alerta no momento.',
    // Toasts e mensagens
    normalCallToast: 'Chamada Normal',
    normalCallStarted: 'Chamada {id} iniciada com sucesso',
    oneWayAudioToast: 'One-Way Audio',
    oneWayAudioDetected: 'Problema detectado na chamada {id}',
    natProblemToast: 'Problema NAT',
    natProblemDetected: 'IP privado detectado na chamada {id}',
    trafficAnalysisToast: 'Análise de Tráfego',
    analysisStarted: 'Análise iniciada',
    analysisCompleted: 'Análise Concluída',
    trafficNormal: 'Tráfego normal, sem problemas detectados',
    autoResolveActivated: 'Auto-resolução ATIVADA',
    autoResolveDeactivated: 'Auto-resolução DESATIVADA',
    oneWayAudioResolved: 'Problema de áudio resolvido na chamada {id}',
    natProblemResolved: 'Problema NAT resolvido na chamada {id}',
    systemCleared: 'Todos os dados foram limpos',
    eventsCleared: 'Eventos limpos',
    helpToast: 'Ajuda',
    helpMessage: 'Clique nos botões de simulação para testar o sistema',
    // Eventos
    callStart: 'Chamada {id}: {from} -> {to} iniciada',
    callEnd: 'Chamada {id} finalizada - Duração: {duration}s',
    audioProblem: 'One-Way Audio detectado na chamada {id}',
    natDetected: 'IP privado detectado: {from} na chamada {id}',
    analysisStart: 'Iniciando análise de tráfego SIP/RTP...',
    analysisComplete: 'Análise de tráfego concluída - Sistema normal',
    autoResolve: 'One-Way Audio resolvido automaticamente na chamada {id}',
    natConfigured: 'NAT configurado automaticamente para chamada {id}',
    systemAutoResolveActivated: 'Auto-resolução ativada',
    systemAutoResolveDeactivated: 'Auto-resolução desativada',
    systemClearedByUser: 'Todos os dados limpos pelo usuário',
    backgroundSipRegister: 'SIP: Registrando usuário',
    backgroundRtpPacket: 'RTP: Pacote recebido',
    backgroundSystemCheck: 'SYSTEM: Verificando conexões',
    backgroundMonitorAnalysis: 'MONITOR: Análise de qualidade em andamento',
    // Status
    active: 'Ativa',
    problem: 'Problema',
    nat: 'NAT',
    recovered: 'Recuperada',
    excellent: 'Excelente',
    good: 'Bom',
    regular: 'Regular',
    bad: 'Ruim',
    terrible: 'Péssima',
    resolved: 'Resolvido',
    natConfigured: 'NAT Configurado',
    // Alertas
    oneWayAudioAlert: 'One-Way Audio',
    oneWayAudioAlertDesc: 'Chamada {id} com áudio em uma direção apenas',
    natProblemAlert: 'Problema NAT',
    natProblemAlertDesc: 'IP privado {from} detectado na chamada {id}',
    // Tooltips
    normalCallTooltip: 'Cria uma chamada VoIP perfeita sem problemas de áudio, latência baixa e qualidade excelente (MOS 4.0+). Ideal para testar o funcionamento normal do sistema.',
    oneWayAudioTooltip: 'Gera um problema clássico de VoIP onde o áudio flui apenas em uma direção. Causa alertas e pode ser resolvido automaticamente se a função estiver ativa.',
    natProblemTooltip: 'Cria problemas de NAT (Network Address Translation) onde um IP privado tenta se comunicar externamente. Gera alertas críticos e afeta drasticamente a qualidade da chamada.',
    trafficAnalysisTooltip: 'Executa uma análise completa do tráfego SIP/RTP, verificando codecs, largura de banda, jitter e packet loss. Mostra o processo de diagnóstico em tempo real.',
    autoResolveTooltip: 'Ativa/desativa o sistema de resolução automática de problemas. Quando ativo, o sistema detecta e corrige automaticamente issues como One-Way Audio e problemas de NAT.',
    clearAllDataTooltip: 'Limpa completamente todos os dados do sistema: chamadas ativas, eventos, alertas e estatísticas. Útil para recomeçar testes ou limpar a interface.',
    languageTooltip: 'Mude o idioma da interface entre Português e Inglês. A preferência é salva automaticamente.',
    connectionStatusTooltip: 'Status da conexão com o sistema. Verde indica que está online e funcionando normalmente.',
    currentTimeTooltip: 'Horário atual do servidor. Atualizado a cada segundo.',
    userMenuTooltip: 'Menu de usuário com opções de ajuda e reinicialização do sistema.',
    helpTooltip: 'Exibe informações de ajuda sobre como usar o sistema de monitoramento VoIP.',
    resetSystemTooltip: 'Reinicia completamente o sistema, recarregando a página e limpando todos os dados temporários.',
    activeCallsTooltip: 'Número total de chamadas VoIP ativas no momento. Cada chamada aparece aqui com detalhes de origem, destino e qualidade.',
    alertsTooltip: 'Contagem de alertas ativos no sistema. Alertas são gerados quando problemas como One-Way Audio ou NAT são detectados.',
    eventsTooltip: 'Total de eventos registrados pelo sistema. Inclui chamadas, problemas, análises e eventos de background.',
    cpuTooltip: 'Uso da CPU pelo sistema. Varia entre 10-40% para demonstrar monitoramento de recursos.',
    clearEventsTooltip: 'Limpa o histórico de eventos. Remove todos os eventos registrados mas mantém as chamadas ativas e alertas.'
  },
  en: {
    online: 'Online',
    demoUser: 'Demo User',
    help: 'Help',
    resetSystem: 'Reset System',
    activeCalls: 'Active Calls',
    alerts: 'Alerts',
    events: 'Events',
    cpu: 'CPU',
    controlPanel: 'Control Panel',
    normalCall: 'Normal Call',
    normalCallDesc: 'Simulate call without problems',
    oneWayAudio: 'One-Way Audio',
    oneWayAudioDesc: 'Audio in one direction only',
    natProblem: 'NAT Problem',
    natProblemDesc: 'Private IP detected',
    trafficAnalysis: 'Analyze Traffic',
    trafficAnalysisDesc: 'SIP/RTP Analysis',
    activateAutoResolve: 'Activate Auto-Resolve',
    deactivateAutoResolve: 'Deactivate Auto-Resolve',
    clearAllData: 'Clear All Data',
    activeCallsTitle: 'Active Calls',
    realTimeEvents: 'Real-time Events',
    systemAlerts: 'System Alerts',
    tableId: 'ID',
    tableFrom: 'From',
    tableTo: 'To',
    tableStatus: 'Status',
    tableQuality: 'Quality',
    noActiveCalls: 'No active calls',
    waitingEvents: 'Waiting for events...',
    systemNormal: 'System operating normally. No alerts at the moment.',
    // Toasts e mensagens
    normalCallToast: 'Normal Call',
    normalCallStarted: 'Call {id} started successfully',
    oneWayAudioToast: 'One-Way Audio',
    oneWayAudioDetected: 'Problem detected in call {id}',
    natProblemToast: 'NAT Problem',
    natProblemDetected: 'Private IP detected in call {id}',
    trafficAnalysisToast: 'Traffic Analysis',
    analysisStarted: 'Analysis started',
    analysisCompleted: 'Analysis Completed',
    trafficNormal: 'Normal traffic, no problems detected',
    autoResolveActivated: 'Auto-resolve ACTIVATED',
    autoResolveDeactivated: 'Auto-resolve DEACTIVATED',
    oneWayAudioResolved: 'Audio problem resolved in call {id}',
    natProblemResolved: 'NAT problem resolved in call {id}',
    systemCleared: 'All data has been cleared',
    eventsCleared: 'Events cleared',
    helpToast: 'Help',
    helpMessage: 'Click simulation buttons to test the system',
    // Eventos
    callStart: 'Call {id}: {from} -> {to} started',
    callEnd: 'Call {id} ended - Duration: {duration}s',
    audioProblem: 'One-Way Audio detected in call {id}',
    natDetected: 'Private IP detected: {from} in call {id}',
    analysisStart: 'Starting SIP/RTP traffic analysis...',
    analysisComplete: 'Traffic analysis completed - System normal',
    autoResolve: 'One-Way Audio automatically resolved in call {id}',
    natConfigured: 'NAT automatically configured for call {id}',
    systemAutoResolveActivated: 'Auto-resolve activated',
    systemAutoResolveDeactivated: 'Auto-resolve deactivated',
    systemClearedByUser: 'All data cleared by user',
    backgroundSipRegister: 'SIP: Registering user',
    backgroundRtpPacket: 'RTP: Packet received',
    backgroundSystemCheck: 'SYSTEM: Checking connections',
    backgroundMonitorAnalysis: 'MONITOR: Quality analysis in progress',
    // Status
    active: 'Active',
    problem: 'Problem',
    nat: 'NAT',
    recovered: 'Recovered',
    excellent: 'Excellent',
    good: 'Good',
    regular: 'Regular',
    bad: 'Bad',
    terrible: 'Terrible',
    resolved: 'Resolved',
    natConfigured: 'NAT Configured',
    // Alertas
    oneWayAudioAlert: 'One-Way Audio',
    oneWayAudioAlertDesc: 'Call {id} with audio in one direction only',
    natProblemAlert: 'NAT Problem',
    natProblemAlertDesc: 'Private IP {from} detected in call {id}',
    // Tooltips
    normalCallTooltip: 'Creates a perfect VoIP call with no audio issues, low latency and excellent quality (MOS 4.0+). Ideal for testing normal system operation.',
    oneWayAudioTooltip: 'Generates a classic VoIP problem where audio flows only in one direction. Causes alerts and can be automatically resolved if the function is active.',
    natProblemTooltip: 'Creates NAT (Network Address Translation) problems where a private IP tries to communicate externally. Generates critical alerts and drastically affects call quality.',
    trafficAnalysisTooltip: 'Performs complete SIP/RTP traffic analysis, checking codecs, bandwidth, jitter and packet loss. Shows the diagnostic process in real time.',
    autoResolveTooltip: 'Activates/deactivates the automatic problem resolution system. When active, the system detects and automatically fixes issues like One-Way Audio and NAT problems.',
    clearAllDataTooltip: 'Completely clears all system data: active calls, events, alerts and statistics. Useful for restarting tests or cleaning the interface.',
    languageTooltip: 'Change the interface language between Portuguese and English. Preference is automatically saved.',
    connectionStatusTooltip: 'System connection status. Green indicates it is online and functioning normally.',
    currentTimeTooltip: 'Current server time. Updated every second.',
    userMenuTooltip: 'User menu with help and system reset options.',
    helpTooltip: 'Displays help information on how to use the VoIP monitoring system.',
    resetSystemTooltip: 'Completely restarts the system, reloading the page and clearing all temporary data.',
    activeCallsTooltip: 'Total number of active VoIP calls at the moment. Each call appears here with origin, destination and quality details.',
    alertsTooltip: 'Count of active alerts in the system. Alerts are generated when problems like One-Way Audio or NAT are detected.',
    eventsTooltip: 'Total events registered by the system. Includes calls, problems, analysis and background events.',
    cpuTooltip: 'CPU usage by the system. Varies between 10-40% to demonstrate resource monitoring.',
    clearEventsTooltip: 'Clears the event history. Removes all registered events but keeps active calls and alerts.'
  }
};

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
    this.currentLang = 'pt'; // Idioma padrão
    
    this.init();
  }

  init() {
    // Carregar idioma salvo ou usar padrão
    const savedLang = localStorage.getItem('voipMonitorLang') || 'pt';
    this.changeLanguage(savedLang);
    
    this.updateTime();
    this.updateSystemStats();
    this.startBackgroundSimulation();
    
    // Inicializar tooltips do Bootstrap
    this.updateTooltips();
    
    // Atualizar tempo a cada segundo
    setInterval(() => this.updateTime(), 1000);
    
    // Atualizar stats a cada 3 segundos
    setInterval(() => this.updateSystemStats(), 3000);
    
    console.log('VoIP Monitor Dashboard iniciado');
  }

  // Sistema de Tradução
  changeLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem('voipMonitorLang', lang);
    
    // Atualizar botão de idioma
    const langButton = document.getElementById('currentLang');
    if (langButton) {
      langButton.textContent = lang.toUpperCase();
    }
    
    // Traduzir todos os elementos com data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (translations[lang] && translations[lang][key]) {
        element.textContent = translations[lang][key];
      }
    });
    
    // Atualizar tooltips
    this.updateTooltips();
    
    // Atualizar texto do botão auto-resolve
    this.updateAutoResolveButtonText();
    
    // Atualizar tabelas se houver chamadas ativas
    this.updateCallsTable();
    
    // Atualizar alertas para refletir novo idioma
    this.updateAlerts();
    
    // Atualizar feed de eventos se não houver eventos
    if (this.events.length === 0) {
      this.updateEventsFeed();
    }
    
    this.showToast('Language', lang === 'pt' ? 'Idioma alterado para Português' : 'Language changed to English', 'info');
  }

  updateTooltips() {
    // Mapeamento de elementos para tooltips
    const tooltipMap = {
      'simulateNormalCall': 'normalCallTooltip',
      'simulateOneWayAudio': 'oneWayAudioTooltip', 
      'simulateNatProblem': 'natProblemTooltip',
      'simulateTrafficAnalysis': 'trafficAnalysisTooltip',
      'toggleAutoResolve': 'autoResolveTooltip',
      'clearAllData': 'clearAllDataTooltip',
      'changeLanguage': 'languageTooltip',
      'connectionStatus': 'connectionStatusTooltip',
      'currentTime': 'currentTimeTooltip',
      'userMenu': 'userMenuTooltip',
      'showHelp': 'helpTooltip',
      'resetSystem': 'resetSystemTooltip',
      'activeCalls': 'activeCallsTooltip',
      'alerts': 'alertsTooltip',
      'events': 'eventsTooltip',
      'cpu': 'cpuTooltip',
      'clearEvents': 'clearEventsTooltip'
    };

    // Atualizar tooltips baseados nos atributos onclick e data-i18n
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(element => {
      const onclick = element.getAttribute('onclick');
      const dataI18n = element.getAttribute('data-i18n');
      
      let tooltipKey = null;
      
      // Tentar encontrar pelo onclick
      if (onclick) {
        Object.keys(tooltipMap).forEach(func => {
          if (onclick.includes(func)) {
            tooltipKey = tooltipMap[func];
          }
        });
      }
      
      // Tentar encontrar pelo data-i18n
      if (!tooltipKey && dataI18n) {
        tooltipKey = tooltipMap[dataI18n];
      }
      
      // Tentar encontrar pelo ID
      if (!tooltipKey && element.id) {
        tooltipKey = tooltipMap[element.id];
      }
      
      // Se encontrou a chave, atualizar o tooltip
      if (tooltipKey && translations[this.currentLang][tooltipKey]) {
        element.setAttribute('title', translations[this.currentLang][tooltipKey]);
      }
    });
    
    // Re-inicializar tooltips do Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  t(key, params = {}) {
    if (!translations[this.currentLang] || !translations[this.currentLang][key]) {
      return key;
    }
    
    let text = translations[this.currentLang][key];
    
    // Substituir parâmetros {param}
    Object.keys(params).forEach(param => {
      text = text.replace(new RegExp(`{${param}}`, 'g'), params[param]);
    });
    
    return text;
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
      status: this.t('active'),
      quality: this.t('excellent'),
      startTime: new Date(),
      duration: 0,
      latency: Math.floor(Math.random() * 50) + 10,
      packetLoss: Math.floor(Math.random() * 2),
      mos: (Math.random() * 0.5 + 4.0).toFixed(1)
    };

    this.calls.set(callId, call);
    this.stats.activeCalls++;
    
    this.addEvent(`CALL_START`, this.t('callStart', {id: callId, from: from, to: to}));
    this.showToast(this.t('normalCallToast'), this.t('normalCallStarted', {id: callId}), 'success');
    
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
      status: this.t('problem'),
      quality: this.t('bad'),
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
    
    this.addEvent('AUDIO_PROBLEM', this.t('audioProblem', {id: callId}));
    this.addAlert('warning', this.t('oneWayAudioAlert'), this.t('oneWayAudioAlertDesc', {id: callId}));
    this.showToast(this.t('oneWayAudioToast'), this.t('oneWayAudioDetected', {id: callId}), 'warning');
    
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
      status: this.t('nat'),
      quality: this.t('terrible'),
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
    
    this.addEvent('NAT_DETECTED', this.t('natDetected', {from: from, id: callId}));
    this.addAlert('danger', this.t('natProblemAlert'), this.t('natProblemAlertDesc', {from: from, id: callId}));
    this.showToast(this.t('natProblemToast'), this.t('natProblemDetected', {id: callId}), 'danger');
    
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
    this.addEvent('ANALYSIS_START', this.t('analysisStart'));
    this.showToast(this.t('trafficAnalysisToast'), this.t('analysisStarted'), 'info');
    
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
      this.addEvent('ANALYSIS_COMPLETE', this.t('analysisComplete'));
      this.showToast(this.t('analysisCompleted'), this.t('trafficNormal'), 'success');
    }, analysisEvents.length * 800 + 1000);
  }

  // Funções de Resolução
  resolveOneWayAudio(callId) {
    const call = this.calls.get(callId);
    if (call && call.issue === 'One-Way Audio') {
      call.issue = this.t('resolved');
      call.quality = this.t('good');
      call.status = this.t('recovered');
      this.stats.alertCount--;
      
      this.addEvent('AUTO_RESOLVE', this.t('oneWayAudioResolved', {id: callId}));
      this.showToast('Auto-Resolução', this.t('oneWayAudioResolved', {id: callId}), 'success');
      
      this.updateCallsTable();
      this.updateMetrics();
      this.updateAlerts();
    }
  }

  resolveNatProblem(callId) {
    const call = this.calls.get(callId);
    if (call && call.issue === 'NAT Problem') {
      call.issue = this.t('natConfigured');
      call.quality = this.t('regular');
      call.status = this.t('recovered');
      this.stats.alertCount--;
      
      this.addEvent('AUTO_RESOLVE', this.t('natProblemResolved', {id: callId}));
      this.showToast('Auto-Resolução', this.t('natProblemResolved', {id: callId}), 'success');
      
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
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">${this.t('noActiveCalls')}</td></tr>`;
      return;
    }
    
    tbody.innerHTML = '';
    
    this.calls.forEach(call => {
      const row = document.createElement('tr');
      
      let statusClass = 'text-success';
      if (call.status === this.t('problem') || call.status === this.t('nat')) {
        statusClass = 'text-danger';
      } else if (call.status === this.t('recovered')) {
        statusClass = 'text-warning';
      }
      
      let qualityClass = 'text-success';
      if (call.quality === this.t('bad') || call.quality === this.t('terrible')) {
        qualityClass = 'text-danger';
      } else if (call.quality === this.t('regular') || call.quality === this.t('good')) {
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
      feed.innerHTML = `<div class="text-muted text-center">${this.t('waitingEvents')}</div>`;
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
          ${this.t('systemNormal')}
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
      this.addEvent('CALL_END', this.t('callEnd', {id: callId, duration: duration}));
      
      this.updateCallsTable();
      this.updateMetrics();
    }
  }

  // Funções de Controle
  updateAutoResolveButtonText() {
    const button = document.getElementById('autoResolveText');
    if (button) {
      button.textContent = this.autoResolveEnabled ? this.t('deactivateAutoResolve') : this.t('activateAutoResolve');
    }
  }

  toggleAutoResolve() {
    this.autoResolveEnabled = !this.autoResolveEnabled;
    this.updateAutoResolveButtonText();
    
    if (this.autoResolveEnabled) {
      this.showToast('Auto-Resolução', this.t('autoResolveActivated'), 'success');
      this.addEvent('SYSTEM', this.t('systemAutoResolveActivated'));
    } else {
      this.showToast('Auto-Resolução', this.t('autoResolveDeactivated'), 'info');
      this.addEvent('SYSTEM', this.t('systemAutoResolveDeactivated'));
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
    
    this.showToast('Sistema', this.t('systemCleared'), 'info');
    this.addEvent('SYSTEM', this.t('systemClearedByUser'));
  }

  clearEvents() {
    this.events = [];
    this.stats.eventCount = 0;
    this.updateEventsFeed();
    this.updateMetrics();
    this.showToast('Eventos', this.t('eventsCleared'), 'info');
  }

  showHelp() {
    this.showToast(this.t('helpToast'), this.t('helpMessage'), 'info');
  }

  resetSystem() {
    if (confirm(this.currentLang === 'pt' ? 'Tem certeza que deseja reiniciar o sistema?' : 'Are you sure you want to reset the system?')) {
      location.reload();
    }
  }

  // Simulação em background
  startBackgroundSimulation() {
    // Simular eventos aleatórios a cada 15-30 segundos
    setInterval(() => {
      if (Math.random() < 0.3) {
        const events = [
          this.t('backgroundSipRegister'),
          this.t('backgroundRtpPacket'),
          this.t('backgroundSystemCheck'),
          this.t('backgroundMonitorAnalysis')
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

function changeLanguage(lang) {
  monitor.changeLanguage(lang);
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  monitor = new VoIPMonitor();
});
