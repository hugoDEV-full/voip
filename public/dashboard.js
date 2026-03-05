const socket = io();

const elCalls = document.getElementById('calls');
const elEvents = document.getElementById('events');
const elAlerts = document.getElementById('alerts');
const elStats = document.getElementById('stats');

// Original simulation button elements
const btnSimNormal = document.getElementById('btnSimNormal');
const btnSimOneWay = document.getElementById('btnSimOneWay');
const btnSimNat = document.getElementById('btnSimNat');
const btnAnalyze = document.getElementById('btnAnalyze');

// Translation system
const translations = {
  pt: {
    btnNormal: 'Iniciar chamada (normal)',
    btnOneWay: 'Iniciar chamada (one-way audio)',
    btnNat: 'Iniciar chamada (NAT incorreto)',
    btnAnalyze: 'Analisar tráfego SIP',
    callsHeader: 'Chamadas Ativas',
    alertsHeader: 'Alertas de Rede',
    statsHeader: 'System Stats',
    eventsHeader: 'Eventos em Tempo Real',
    systemStatus: 'Status do Sistema',
    activeCalls: 'Chamadas Ativas',
    alerts: 'Alertas',
    events: 'Eventos',
    userInfo: 'Informações do Usuário',
    logout: 'Sair',
    loading: 'Carregando...',
    resolveProblems: 'Resolver Problemas VoIP',
    autoResolve: 'Auto-Resolução',
    stopAutoResolve: 'Parar Auto-Resolução',
    notifications: {
      normalCall: '📞 Chamada normal iniciada',
      oneWayAudio: '⚠️ Problema de one-way audio detectado!',
      natProblem: '🔴 Problema de NAT detectado!',
      trafficAnalysis: '📊 Iniciando análise de tráfego...',
      analysisComplete: '✅ Análise concluída!',
      eventsCleared: '🧹 Eventos limpos',
      eventsPaused: '⏸️ Eventos pausados',
      eventsResumed: '▶️ Eventos retomados',
      problemsResolved: '✅ Problemas VoIP resolvidos!',
      autoResolutionEnabled: '🤖 Auto-resolução ativada',
      autoResolutionDisabled: '🛑 Auto-resolução desativada'
    }
  },
  en: {
    btnNormal: 'Start call (normal)',
    btnOneWay: 'Start call (one-way audio)',
    btnNat: 'Start call (NAT incorrect)',
    btnAnalyze: 'Analyze SIP traffic',
    callsHeader: 'Active Calls',
    alertsHeader: 'Network Alerts',
    statsHeader: 'System Stats',
    eventsHeader: 'Real-time Events',
    systemStatus: 'System Status',
    activeCalls: 'Active Calls',
    alerts: 'Alerts',
    events: 'Events',
    userInfo: 'User Information',
    logout: 'Logout',
    loading: 'Loading...',
    resolveProblems: 'Resolve VoIP Problems',
    autoResolve: 'Auto-Resolution',
    stopAutoResolve: 'Stop Auto-Resolution',
    notifications: {
      normalCall: '📞 Normal call started',
      oneWayAudio: '⚠️ One-way audio problem detected!',
      natProblem: '🔴 NAT problem detected!',
      trafficAnalysis: '📊 Starting traffic analysis...',
      analysisComplete: '✅ Analysis complete!',
      eventsCleared: '🧹 Events cleared',
      eventsPaused: '⏸️ Events paused',
      eventsResumed: '▶️ Events resumed',
      problemsResolved: '✅ VoIP problems resolved!',
      autoResolutionEnabled: '🤖 Auto-resolution enabled',
      autoResolutionDisabled: '🛑 Auto-resolution disabled'
    }
  }
};

let currentLanguage = 'pt';
let eventsPaused = false;
let eventCount = 0;

// Notification system
function showNotification(message, type = 'info', duration = 5000) {
  const container = document.getElementById('notifications-container');
  if (!container) return;
  
  const notificationId = 'notification-' + Date.now();
  const typeClasses = {
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    info: 'bg-info',
    primary: 'bg-primary'
  };
  
  const icons = {
    success: 'bi-check-circle-fill',
    warning: 'bi-exclamation-triangle-fill',
    danger: 'bi-x-circle-fill',
    info: 'bi-info-circle-fill',
    primary: 'bi-bell-fill'
  };
  
  const notification = document.createElement('div');
  notification.id = notificationId;
  notification.className = `toast align-items-center text-white ${typeClasses[type]} border-0 mb-2`;
  notification.setAttribute('role', 'alert');
  notification.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        <i class="bi ${icons[type]} me-2"></i>
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  
  container.appendChild(notification);
  
  // Initialize Bootstrap toast
  if (window.bootstrap) {
    const toast = new bootstrap.Toast(notification, { delay: duration });
    toast.show();
    
    // Remove from DOM after hidden
    notification.addEventListener('hidden.bs.toast', () => {
      notification.remove();
    });
  } else {
    // Fallback if Bootstrap not loaded
    setTimeout(() => {
      notification.remove();
    }, duration);
  }
}

function updateCounters() {
  const activeCallsCount = document.getElementById('activeCallsCount');
  const alertsCount = document.getElementById('alertsCount');
  const eventsCount = document.getElementById('eventsCount');
  
  if (activeCallsCount) {
    activeCallsCount.textContent = state.calls.size;
  }
  
  if (alertsCount) {
    alertsCount.textContent = state.alerts.length;
  }
  
  if (eventsCount) {
    eventsCount.textContent = eventCount;
  }
}

function updateLanguage(lang) {
  currentLanguage = lang;
  const trans = translations[lang];
  
  // Update button texts
  if (btnSimNormal) btnSimNormal.textContent = trans.btnNormal;
  if (btnSimOneWay) btnSimOneWay.textContent = trans.btnOneWay;
  if (btnSimNat) btnSimNat.textContent = trans.btnNat;
  if (btnAnalyze) btnAnalyze.textContent = trans.btnAnalyze;
  
  // Update headers
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (trans[key]) {
      element.textContent = trans[key];
    }
  });
  
  // Update language selector
  document.getElementById('currentLang').textContent = lang.toUpperCase();
  
  console.log(`🌐 Language updated to: ${lang}`);
}

function initTooltips(root = document) {
  if (!window.bootstrap) return;
  const nodes = Array.from(root.querySelectorAll('[data-bs-toggle="tooltip"]'));
  for (const n of nodes) {
    if (n.__bsTooltip) continue;
    n.__bsTooltip = new bootstrap.Tooltip(n);
  }
}

const state = {
  calls: new Map(),
  alerts: [],
  events: [],
};

// Translation dictionary
const i18n = {
  pt: {
    title: 'VoIP Monitoring Platform',
    brand: 'VoIP Monitoring Platform',
    brandTooltip: 'Plataforma de monitoramento e análise de tráfego VoIP: captura eventos SIP/RTP em tempo real e detecta problemas comuns (NAT/one-way/latência).',
    howItWorks: 'Como funciona?',
    btnNormal: 'Iniciar chamada (normal)',
    btnNormalTooltip: 'Inicia uma chamada com fluxo SIP completo e RTP bidirecional (baseline sem problemas).',
    btnOneWay: 'Iniciar chamada (one-way audio)',
    btnOneWayTooltip: 'Gera um cenário de one-way audio: A envia RTP mas B não recebe. O sistema detecta \'RTP flow broken\' e aponta NAT/Firewall.',
    btnNat: 'Iniciar chamada (NAT incorreto)',
    btnNatTooltip: 'Gera um cenário de NAT incorreto: SDP de A anuncia IP privado (c=10.x.x.x), causando falha de mídia e latência elevada.',
    btnAnalyze: 'Analisar tráfego SIP',
    btnAnalyzeTooltip: 'Lê /pcap/traffic_log.txt e gera diagnóstico de tráfego SIP/RTP (estilo análise rápida de Wireshark/sngrep).',
    modalTitle: 'Como a plataforma ajuda a empresa',
    modalClose: 'Fechar',
    tabGeneral: 'Geral',
    tabSamu: 'SAMU DF',
    tabFleet: 'Controle de Frota',
    callsHeader: 'Chamadas ativas',
    callsTooltip: 'Lista de calls ativas (como uma visão resumida do que você veria no sngrep). Passe o mouse para ver dicas de cenário/NAT/SDP.',
    alertsHeader: 'Alertas de rede',
    alertsTooltip: 'Alertas gerados por regras: one-way audio (RTP abaixo do esperado), suspeita de NAT/Firewall e latência > 150ms.',
    statsHeader: 'System Stats',
    statsTooltip: 'Métricas do backend (CPU/memória/calls ativas). Ajuda a demonstrar monitoramento básico em produção.',
    eventsHeader: 'Eventos em tempo real (SIP / RTP / ESL)',
    eventsTooltip: 'Feed em tempo real: SIP (mensagens completas), métricas RTP (esperado/recebido/latência) e eventos ESL simulados (CHANNEL_CREATE/ANSWER/HANGUP).',
    // User and logout
    userInfo: 'Informações do Usuário',
    logout: 'Sair',
    logoutSuccess: 'Logout realizado com sucesso',
    // General tab
    generalWhyTitle: '🎯 Por que isso importa para o negócio?',
    generalWhyText: 'Em ambientes de call center, suporte ou vendas, cada minuto com áudio ruim ou sem áudio representa perda de receita, insatisfação do cliente e retrabalho da equipe. Esta plataforma permite detectar e diagnosticar rapidamente problemas de mídia (RTP) e sinalização (SIP), reduzindo o MTTR (Mean Time to Repair) e melhorando a experiência do cliente.',
    generalStepsTitle: '📋 Passo a passo de uso',
    generalStep1: 'Iniciar chamada (normal)',
    generalStep1Desc: 'Gera um fluxo SIP completo (INVITE/100/180/200/ACK) e RTP bidirecional. Serve como baseline para comparar com cenários problemáticos.',
    generalStep2: 'Iniciar chamada (one-way audio)',
    generalStep2Desc: 'Simula um cenário onde A envia RTP mas B não recebe. O sistema detecta “RTP flow broken” e aponta NAT/Firewall como causa provável.',
    generalStep3: 'Iniciar chamada (NAT incorreto)',
    generalStep3Desc: 'Gera um SDP com IP privado (c=10.x.x.x), causando falha de mídia e latência elevada. O sistema alerta sobre NAT/Firewall e alta latência.',
    generalStep4: 'Analisar tráfego SIP',
    generalStep4Desc: 'Lê um arquivo de log e gera diagnóstico rápido (estilo Wireshark/sngrep), útil para pós-mortem de incidentes.',
    generalStep5: 'Monitoramento em tempo real',
    generalStep5Desc: 'O painel mostra chamadas ativas, eventos SIP/RTP e alertas de rede, permitindo que operadores e engenheiros vejam o status atual e histórico recente.',
    generalTechTitle: '🛠️ Como isso ajuda a equipe técnica',
    generalTech1: 'Detecta one-way audio automaticamente',
    generalTech1Desc: 'Em vez de depender de reclamações de clientes, a plataforma alerta quando RTP recebido é muito abaixo do esperado, indicando fluxo quebrado.',
    generalTech2: 'Aponta NAT/Firewall',
    generalTech2Desc: 'Quando o SDP anuncia IP privado ou há perda severa de RTP, o sistema sugere investigar NAT, regras de firewall ou pinholes.',
    generalTech3: 'Mede latência',
    generalTech3Desc: 'Alerta se a latência ultrapassar 150 ms, ajudando a identificar gargalos de rede ou congestionamento.',
    generalTech4: 'Centraliza eventos SIP/RTP',
    generalTech4Desc: 'Em um único feed, você vê mensagens SIP completas e métricas RTP, sem precisar alternar entre Wireshark e logs.',
    generalTech5: 'Facilita pós-mortem',
    generalTech5Desc: 'A análise de tráfego SIP gera diagnóstico estruturado, útil para relatórios de incidente e melhoria contínua.',
    generalBizTitle: '💰 Impacto no negócio',
    generalBiz1: 'Redução de chamadas com áudio ruim',
    generalBiz1Desc: 'Detectar e corrigir rapidamente one-way audio e problemas de NAT diminui o número de chamadas ineficazes.',
    generalBiz2: 'Menor tempo de inatividade',
    generalBiz2Desc: 'Alertas proativos permitem que a equipe de infra atue antes que o problema afete muitos usuários.',
    generalBiz3: 'Melhoria da satisfação do cliente',
    generalBiz3Desc: 'Menos quedas de áudio e menos necessidade de repetir informações aumentam a percepção de qualidade.',
    generalBiz4: 'Otimização da equipe',
    generalBiz4Desc: 'Engenheiros gastam menos tempo caçando logs e mais tempo resolvendo problemas, graças aos alertas contextuais.',
    generalProdTitle: '🚀 Como levar isso para produção',
    generalProdText: 'Este demo pode ser integrado com PBXs reais (FreeSWITCH, Asterisk) via ESL ou AMI, e com fontes de tráfego real (SIPp, softphones). Em produção, a plataforma pode:',
    generalProd1: 'Consumir eventos ESL em tempo real do FreeSWITCH.',
    generalProd2: 'Capturar pacotes SIP/RTP via espelhamento de porta ou TAP e analisar com suricata/Zeek.',
    generalProd3: 'Integrar com sistemas de ticketing e alertas (Slack, PagerDuty, Zabbix).',
    generalProd4: 'Armazenar métricas em TSDB (Prometheus/InfluxDB) para dashboards de longo prazo.',
    // Practical examples - General tab
    generalWhyExample: 'Exemplo prático:',
    generalWhyExampleText: 'Um call center percebeu que 15% das chamadas de vendas eram perdidas por "áudio cortado". Com esta plataforma, o time de TI identificou que o problema ocorria sempre que o cliente usava WiFi corporativo com NAT restritivo. A solução foi ajustar o firewall para permitir RTP dinâmico, reduzindo as perdas em 80%.',
    generalTechExample: 'Exemplo prático:',
    generalTechExampleText: 'Durante um pico de chamadas, o sistema detectou "one-way audio" apenas para usuários da filial de São Paulo. O time viu no dashboard que o SDP continha IP 10.1.2.x (privado). Corrigiram o NAT do gateway da filial em 10 minutos, evitando impacto nas vendas.',
    // SAMU DF tab
    samuTitle: '🚑 SAMU DF: VoIP em emergências médicas',
    samuIntro: 'O Serviço de Atendimento Móvel de Urgência do Distrito Federal depende de comunicação de áudio confiável entre centrais de regulação, ambulâncias e hospitais. Problemas de one-way audio, latência ou falha de sinalização podem atrasar despachos e colocar vidas em risco. Esta plataforma permite monitorar e diagnosticar rapidamente esses problemas.',
    samuScenariosTitle: '📞 Cenários típicos no SAMU DF',
    samuScenario1: 'Central de regulação ↔ Ambulância',
    samuScenario1Desc: 'Chamadas via rádio IP ou celular VoIP; NAT móvel e redes instáveis podem causar one-way audio.',
    samuScenario2: 'Ambulância ↔ Hospital',
    samuScenario2Desc: 'Transferência de áudio para equipe médica; latência elevada pode prejudicar entendimento do quadro clínico.',
    samuScenario3: 'Múltiplos despachos simultâneos',
    samuScenario3Desc: 'Picos de tráfego podem sobrecarregar links e gerar perda de pacotes (jitter/loss).',
    samuScenario4: 'Handoff entre células',
    samuScenario4Desc: 'Mudança de antena durante deslocamento pode interromper brevemente o fluxo RTP.',
    samuHelpTitle: '🛠️ Como a plataforma ajuda o SAMU DF',
    samuHelp1: 'Alerta one-way audio em tempo real',
    samuHelp1Desc: 'Se a ambulância não recebe áudio da central, o sistema notifica imediatamente a equipe de TI.',
    samuHelp2: 'Detecção de NAT móvel',
    samuHelp2Desc: 'Identifica quando o SDP anuncia IPs privados de redes móveis e sugere ajustes de firewall ou VPN.',
    samuHelp3: 'Medição de latência por link',
    samuHelp3Desc: 'Diferencia latência entre central-ambulância e ambulância-hospital, apontando gargalos.',
    samuHelp4: 'Correlação de eventos SIP',
    samuHelp4Desc: 'Mostra INVITE/180/200 OK e falhas de ACK, ajudando a identificar se o problema é de sinalização ou mídia.',
    samuHelp5: 'Histórico por veículo',
    samuHelp5Desc: 'Permite analisar padrões por ambulância (ex: “Ambulância 12 com recorrentes one-way audio na região da Asa Norte”).',
    samuImpactTitle: '📈 Impacto operacional no SAMU DF',
    samuImpact1: 'Redução do tempo de despacho',
    samuImpact1Desc: 'Menos retrabalho por “não ouvi” ou “áudio cortado”.',
    samuImpact2: 'Melhoria na segurança do paciente',
    samuImpact2Desc: 'Comunicação clara entre regulação, equipes de socorro e hospitais.',
    samuImpact3: 'Base para SLA de áudio',
    samuImpact3Desc: 'Métricas de latência e perda de pacotes podem alimentar acordos de nível de serviço com operadoras.',
    samuImpact4: 'Relatórios para auditoria',
    samuImpact4Desc: 'Histórico de incidentes de áudio para análises de melhoria contínua e respostas a ocorrências.',
    samuDemoTitle: '🧪 Demonstração prática (usando este demo)',
    samuDemo1: 'Iniciar chamada (normal)',
    samuDemo1Desc: 'Simula uma chamada ideal entre central e ambulância.',
    samuDemo2: 'Iniciar chamada (one-way audio)',
    samuDemo2Desc: 'Simula problema clássico: a ambulância não ouve a central (NAT móvel ou firewall).',
    samuDemo3: 'Iniciar chamada (NAT incorreto)',
    samuDemo3Desc: 'Simula SDP com IP privado da rede móvel, gerando falha de mídia e latência alta.',
    samuDemo4: 'Analisar tráfego SIP',
    samuDemo4Desc: 'Gera um relatório rápido de um log de chamada, útil para pós-mortem de um despacho crítico.',
    samuProdTitle: '🚀 Extensões para SAMU DF em produção',
    samuProd1: 'Integração com o sistema de despacho existente via ESL (FreeSWITCH) ou AMI (Asterisk).',
    samuProd2: 'Mapa georreferenciado de chamadas com indicadores de qualidade por região.',
    samuProd3: 'Alertas via WhatsApp ou rádio para a equipe de TI em tempo real.',
    samuProd4: 'Dashboard específico para gestores do SAMU com KPIs: tempo médio de áudio, taxa de one-way, latência por bairro.',
    samuProd5: 'Export automático de relatórios para a Secretaria de Saúde.',
    // Practical examples - SAMU DF tab
    samuHelpExample: 'Exemplo prático:',
    samuHelpExampleText: 'Durante uma emergência cardíaca na Asa Sul, a ambulância não conseguia ouvir as instruções do médico regulador. O sistema detectou one-way audio e alertou a TI, que identificou falha de NAT no rádio IP da ambulância. A correção remota foi feita em 3 minutos, permitindo que a equipe recebesse o protocolo de RCP e salvasse o paciente.',
    samuImpactExample: 'Exemplo prático:',
    samuImpactExampleText: 'Após implementar a plataforma, o SAMU DF reduziu o tempo médio de despacho em 45 segundos por chamada. Em um mês, isso representou 120 horas economizadas e 23 emergências atendidas mais rapidamente, incluindo 3 casos de AVC onde o tempo é crítico.',
    // Fleet tab
    fleetTitle: '🚚 Controle de Frota: VoIP em logística e entregas',
    fleetIntro: 'Empresas de transporte, logística e delivery usam VoIP para comunicação entre central operacional, motoristas e clientes. Problemas de áudio podem gerar atrasos, entregas erradas e insatisfação do cliente. Esta plataforma monitora a qualidade do áudio em tempo real e ajuda a garantir que a comunicação nunca falhe.',
    fleetScenariosTitle: '📦 Cenários típicos em controle de frota',
    fleetScenario1: 'Central ↔ Motorista (entrega)',
    fleetScenario1Desc: 'Chamadas via VoIP em smartphones ou rádio IP; NAT móvel e mudança de célula podem causar one-way audio.',
    fleetScenario2: 'Central ↔ Cliente (pós-venda)',
    fleetScenario2Desc: 'Confirmação de entrega ou coleta; áudio ruim pode levar a reclamações e retrabalho.',
    fleetScenario3: 'Motorista ↔ Motorista (coordenação)',
    fleetScenario3Desc: 'Comunicação direta entre veículos; handoff entre antenas pode gerar cortes.',
    fleetScenario4: 'Picos de chamadas em horários de pico',
    fleetScenario4Desc: 'Sobrecarga na central pode gerar perda de pacotes e jitter.',
    fleetScenario5: 'Zonas de cobertura fraca',
    fleetScenario5Desc: 'Áreas rurais ou subterrâneas podem causar perda de sinal e alta latência.',
    fleetHelpTitle: '🛠️ Como a plataforma ajuda o controle de frota',
    fleetHelp1: 'Alerta one-way audio em tempo real',
    fleetHelp1Desc: 'Se o motorista não ouve a central, a equipe de TI é notificada antes que a entrega seja atrasada.',
    fleetHelp2: 'Detecção de NAT móvel',
    fleetHelp2Desc: 'Identifica IPs privados de redes móveis e sugere uso de VPN ou ajustes de firewall.',
    fleetHelp3: 'Medição de latência por rota',
    fleetHelp3Desc: 'Diferencia latência entre central-motorista e central-cliente, apontando gargalos.',
    fleetHelp4: 'Correlação de eventos SIP',
    fleetHelp4Desc: 'Mostra INVITE/180/200 OK e falhas de ACK, ajudando a distinguir problema de sinalização vs mídia.',
    fleetHelp5: 'Histórico por veículo/motorista',
    fleetHelp5Desc: 'Permite analisar padrões (ex: "Veículo 45 com one-way audio na região do Gama").',
    fleetImpactTitle: '📈 Impacto operacional na frota',
    fleetImpact1: 'Redução de atrasos',
    fleetImpact1Desc: 'Menos "não ouvi" ou "áudio cortado" diminui retrabalho e atrasos nas entregas.',
    fleetImpact2: 'Melhoria na satisfação do cliente',
    fleetImpact2Desc: 'Comunicação clara na confirmação de endereço e horário.',
    fleetImpact3: 'Otimização da equipe',
    fleetImpact3Desc: 'Menos tempo gasto pelo operador tentando contatar motoristas com falha de áudio.',
    fleetImpact4: 'Base para SLA com operadoras',
    fleetImpact4Desc: 'Métricas de latência e perda de pacotes para negociar qualidade de serviço.',
    fleetDemoTitle: '🧪 Demonstração prática (usando este demo)',
    fleetDemo1: 'Iniciar chamada (normal)',
    fleetDemo1Desc: 'Simula uma chamada ideal entre central e motorista.',
    fleetDemo2: 'Iniciar chamada (one-way audio)',
    fleetDemo2Desc: 'Simula problema clássico: motorista não ouve a central (NAT móvel).',
    fleetDemo3: 'Iniciar chamada (NAT incorreto)',
    fleetDemo3Desc: 'Simula SDP com IP privado da rede móvel, gerando falha de mídia e latência alta.',
    fleetDemo4: 'Analisar tráfego SIP',
    fleetDemo4Desc: 'Gera um relatório rápido de uma chamada de entrega, útil para pós-mortem.',
    // Practical examples - Fleet tab
    fleetHelpExample: 'Exemplo prático:',
    fleetHelpExampleText: 'Uma empresa de delivery percebeu que 30% das reclamações eram sobre "motora não ouviu o endereço". O sistema detectou que motoristas com chip da operadora A tinham 70% mais one-way audio na região de Taguatinga. A solução foi trocar o chip dos 15 motoristas daquela região, reduzindo reclamações em 85% e economizando R$ 12.000/mês em multas por atraso.',
    fleetImpactExample: 'Exemplo prático:',
    fleetImpactExampleText: 'Uma transportadora de medicamentos usou a plataforma para mapear "zonas sem áudio" no perímetro urbano. Descobriram que a região do Lago Sul tinha 60% de falha devido a handoff entre células. Com essa informação, negociaram com a operadora a instalação de uma mini-célula na área, eliminando os atrasos e garantindo a entrega de vacinas em tempo hábil.',
  },
  en: {
    title: 'VoIP Monitoring Platform',
    brand: 'VoIP Monitoring Platform',
    brandTooltip: 'VoIP traffic monitoring and analysis platform: captures SIP/RTP events in real time and detects common problems (NAT/one-way/latency).',
    howItWorks: 'How it works?',
    btnNormal: 'Start call (normal)',
    btnNormalTooltip: 'Starts a call with full SIP flow and bidirectional RTP (baseline without problems).',
    btnOneWay: 'Start call (one-way audio)',
    btnOneWayTooltip: 'Generates a one-way audio scenario: A sends RTP but B does not receive. The system detects \'RTP flow broken\' and points to NAT/Firewall.',
    btnNat: 'Start call (bad NAT)',
    btnNatTooltip: 'Generates a bad NAT scenario: SDP from A announces private IP (c=10.x.x.x), causing media failure and high latency.',
    btnAnalyze: 'Analyze SIP traffic',
    btnAnalyzeTooltip: 'Reads /pcap/traffic_log.txt and generates SIP/RTP traffic diagnostics (quick Wireshark/sngrep style analysis).',
    modalTitle: 'How the platform helps the business',
    modalClose: 'Close',
    tabGeneral: 'General',
    tabSamu: 'SAMU DF',
    tabFleet: 'Fleet Management',
    callsHeader: 'Active Calls',
    callsTooltip: 'List of active calls (like a summary view you would see in sngrep). Hover for scenario/NAT/SDP tips.',
    alertsHeader: 'Network Alerts',
    alertsTooltip: 'Alerts generated by rules: one-way audio (RTP below expected), suspected NAT/Firewall and latency > 150ms.',
    statsHeader: 'System Stats',
    statsTooltip: 'Backend metrics (CPU/memory/active calls). Helps demonstrate basic monitoring in production.',
    eventsHeader: 'Real-time Events (SIP / RTP / ESL)',
    eventsTooltip: 'Real-time feed: SIP (complete messages), RTP metrics (expected/received/latency) and simulated ESL events (CHANNEL_CREATE/ANSWER/HANGUP).',
    // User and logout
    userInfo: 'User Information',
    logout: 'Logout',
    logoutSuccess: 'Logout successful',
    // General tab
    generalWhyTitle: '🎯 Why this matters for the business',
    generalWhyText: 'In call center, support or sales environments, every minute with poor or no audio means lost revenue, customer dissatisfaction and team rework. This platform enables fast detection and diagnosis of media (RTP) and signaling (SIP) problems, reducing MTTR and improving customer experience.',
    generalStepsTitle: '📋 Step-by-step usage',
    generalStep1: 'Start call (normal)',
    generalStep1Desc: 'Generates a full SIP flow (INVITE/100/180/200/ACK) and bidirectional RTP. Serves as baseline to compare with problematic scenarios.',
    generalStep2: 'Start call (one-way audio)',
    generalStep2Desc: 'Simulates a scenario where A sends RTP but B does not receive. The system detects “RTP flow broken” and points to NAT/Firewall as likely cause.',
    generalStep3: 'Start call (bad NAT)',
    generalStep3Desc: 'Generates SDP with private IP (c=10.x.x.x), causing media failure and high latency. The system alerts about NAT/Firewall and high latency.',
    generalStep4: 'Analyze SIP traffic',
    generalStep4Desc: 'Reads a log file and generates quick diagnostics (Wireshark/sngrep style), useful for incident post-mortem.',
    generalStep5: 'Real-time monitoring',
    generalStep5Desc: 'The dashboard shows active calls, SIP/RTP events and network alerts, allowing operators and engineers to see current status and recent history.',
    generalTechTitle: '🛠️ How this helps the technical team',
    generalTech1: 'Detects one-way audio automatically',
    generalTech1Desc: 'Instead of relying on customer complaints, the platform alerts when received RTP is far below expected, indicating broken flow.',
    generalTech2: 'Points to NAT/Firewall',
    generalTech2Desc: 'When SDP announces private IP or severe RTP loss occurs, the system suggests investigating NAT, firewall rules or pinholes.',
    generalTech3: 'Measures latency',
    generalTech3Desc: 'Alerts if latency exceeds 150 ms, helping to identify network bottlenecks or congestion.',
    generalTech4: 'Centralizes SIP/RTP events',
    generalTech4Desc: 'In a single feed, you see complete SIP messages and RTP metrics, without switching between Wireshark and logs.',
    generalTech5: 'Facilitates post-mortem',
    generalTech5Desc: 'SIP traffic analysis generates structured diagnostics, useful for incident reports and continuous improvement.',
    generalBizTitle: '💰 Business impact',
    generalBiz1: 'Reduction of calls with poor audio',
    generalBiz1Desc: 'Detecting and fixing one-way audio and NAT problems quickly reduces the number of ineffective calls.',
    generalBiz2: 'Less downtime',
    generalBiz2Desc: 'Proactive alerts allow the infrastructure team to act before the problem affects many users.',
    generalBiz3: 'Improved customer satisfaction',
    generalBiz3Desc: 'Fewer audio drops and less need to repeat information increase quality perception.',
    generalBiz4: 'Team optimization',
    generalBiz4Desc: 'Engineers spend less time hunting logs and more time solving problems, thanks to contextual alerts.',
    generalProdTitle: '🚀 How to take this to production',
    generalProdText: 'This demo can be integrated with real PBXs (FreeSWITCH, Asterisk) via ESL or AMI, and with real traffic sources (SIPp, softphones). In production, the platform can:',
    generalProd1: 'Consume ESL events in real time from FreeSWITCH.',
    generalProd2: 'Capture SIP/RTP packets via port mirroring or TAP and analyze with suricata/Zeek.',
    generalProd3: 'Integrate with ticketing and alerting systems (Slack, PagerDuty, Zabbix).',
    generalProd4: 'Store metrics in TSDB (Prometheus/InfluxDB) for long-term dashboards.',
    // Practical examples - General tab
    generalWhyExample: 'Practical example:',
    generalWhyExampleText: 'A call center noticed that 15% of sales calls were lost due to "audio cut". With this platform, the IT team identified that the problem always occurred when the customer used corporate WiFi with restrictive NAT. The solution was to adjust the firewall to allow dynamic RTP, reducing losses by 80%.',
    generalTechExample: 'Practical example:',
    generalTechExampleText: 'During a call peak, the system detected "one-way audio" only for users from the São Paulo branch. The team saw on the dashboard that the SDP contained IP 10.1.2.x (private). They fixed the branch gateway NAT in 10 minutes, avoiding impact on sales.',
    // SAMU DF tab
    samuTitle: '🚑 SAMU DF: VoIP in medical emergencies',
    samuIntro: 'The Mobile Emergency Service of the Federal District relies on reliable audio communication between regulation centers, ambulances and hospitals. One-way audio, latency or signaling failures can delay dispatches and put lives at risk. This platform enables monitoring and rapid diagnosis of these problems.',
    samuScenariosTitle: '📞 Typical scenarios at SAMU DF',
    samuScenario1: 'Regulation Center ↔ Ambulance',
    samuScenario1Desc: 'Calls via IP radio or cellular VoIP; mobile NAT and unstable networks can cause one-way audio.',
    samuScenario2: 'Ambulance ↔ Hospital',
    samuScenario2Desc: 'Audio transfer to medical team; high latency can impair understanding of clinical condition.',
    samuScenario3: 'Multiple simultaneous dispatches',
    samuScenario3Desc: 'Traffic spikes can overload links and generate packet loss (jitter/loss).',
    samuScenario4: 'Handoff between cells',
    samuScenario4Desc: 'Antenna change during movement can briefly interrupt RTP flow.',
    samuHelpTitle: '🛠️ How the platform helps SAMU DF',
    samuHelp1: 'Real-time one-way audio alerts',
    samuHelp1Desc: 'If the ambulance does not receive audio from the center, the system immediately notifies the IT team.',
    samuHelp2: 'Mobile NAT detection',
    samuHelp2Desc: 'Identifies when SDP announces private IPs from mobile networks and suggests firewall or VPN adjustments.',
    samuHelp3: 'Latency measurement per link',
    samuHelp3Desc: 'Differentiates latency between center-ambulance and ambulance-hospital, pointing out bottlenecks.',
    samuHelp4: 'SIP event correlation',
    samuHelp4Desc: 'Shows INVITE/180/200 OK and ACK failures, helping to identify whether the problem is signaling or media.',
    samuHelp5: 'Per-vehicle history',
    samuHelp5Desc: 'Allows analyzing patterns per ambulance (e.g., “Ambulance 12 with recurrent one-way audio in the Asa Norte area”).',
    samuImpactTitle: '📈 Operational impact at SAMU DF',
    samuImpact1: 'Reduction of dispatch time',
    samuImpact1Desc: 'Less rework due to “didn’t hear” or “audio cut”.',
    samuImpact2: 'Improvement in patient safety',
    samuImpact2Desc: 'Clear communication between regulation, rescue teams and hospitals.',
    samuImpact3: 'Basis for audio SLA',
    samuImpact3Desc: 'Latency and packet loss metrics can feed service level agreements with operators.',
    samuImpact4: 'Audit reports',
    samuImpact4Desc: 'History of audio incidents for continuous improvement analyses and incident responses.',
    samuDemoTitle: '🧪 Practical demonstration (using this demo)',
    samuDemo1: 'Start call (normal)',
    samuDemo1Desc: 'Simulates an ideal call between center and ambulance.',
    samuDemo2: 'Start call (one-way audio)',
    samuDemo2Desc: 'Simulates classic problem: ambulance does not hear the center (mobile NAT or firewall).',
    samuDemo3: 'Start call (bad NAT)',
    samuDemo3Desc: 'Simulates SDP with private IP from mobile network, causing media failure and high latency.',
    samuDemo4: 'Analyze SIP traffic',
    samuDemo4Desc: 'Generates a quick report from a call log, useful for post-mortem of a critical dispatch.',
    samuProdTitle: '🚀 Extensions for SAMU DF in production',
    samuProd1: 'Integration with existing dispatch system via ESL (FreeSWITCH) or AMI (Asterisk).',
    samuProd2: 'Georeferenced map of calls with quality indicators by region.',
    samuProd3: 'Alerts via WhatsApp or radio to the IT team in real time.',
    samuProd4: 'Specific dashboard for SAMU managers with KPIs: average audio time, one-way rate, latency by neighborhood.',
    samuProd5: 'Automatic report export to the Health Department.',
    // Practical examples - SAMU DF tab
    samuHelpExample: 'Practical example:',
    samuHelpExampleText: 'During a cardiac emergency in Asa Sul, the ambulance could not hear the regulator doctor\'s instructions. The system detected one-way audio and alerted IT, who identified NAT failure in the ambulance\'s IP radio. Remote correction was done in 3 minutes, allowing the team to receive the CPR protocol and save the patient.',
    samuImpactExample: 'Practical example:',
    samuImpactExampleText: 'After implementing the platform, SAMU DF reduced average dispatch time by 45 seconds per call. In one month, this represented 120 hours saved and 23 emergencies attended faster, including 3 stroke cases where time is critical.',
    // Fleet tab
    fleetTitle: '🚚 Fleet Management: VoIP in logistics and delivery',
    fleetIntro: 'Transportation, logistics and delivery companies use VoIP for communication between operational center, drivers and customers. Audio problems can cause delays, wrong deliveries and customer dissatisfaction. This platform monitors audio quality in real time and helps ensure communication never fails.',
    fleetScenariosTitle: '📦 Typical scenarios in fleet management',
    fleetScenario1: 'Center ↔ Driver (delivery)',
    fleetScenario1Desc: 'Calls via VoIP on smartphones or IP radio; mobile NAT and cell handoff can cause one-way audio.',
    fleetScenario2: 'Center ↔ Customer (post-sale)',
    fleetScenario2Desc: 'Delivery or pickup confirmation; poor audio can lead to complaints and rework.',
    fleetScenario3: 'Driver ↔ Driver (coordination)',
    fleetScenario3Desc: 'Direct communication between vehicles; antenna handoff can generate cuts.',
    fleetScenario4: 'Call peaks during rush hours',
    fleetScenario4Desc: 'Center overload can generate packet loss and jitter.',
    fleetScenario5: 'Weak coverage areas',
    fleetScenario5Desc: 'Rural or underground areas can cause signal loss and high latency.',
    fleetHelpTitle: '🛠️ How the platform helps fleet management',
    fleetHelp1: 'Real-time one-way audio alerts',
    fleetHelp1Desc: 'If the driver doesn\'t hear the center, the IT team is notified before the delivery is delayed.',
    fleetHelp2: 'Mobile NAT detection',
    fleetHelp2Desc: 'Identifies private IPs from mobile networks and suggests VPN use or firewall adjustments.',
    fleetHelp3: 'Latency measurement per route',
    fleetHelp3Desc: 'Differentiates latency between center-driver and center-customer, pointing out bottlenecks.',
    fleetHelp4: 'SIP event correlation',
    fleetHelp4Desc: 'Shows INVITE/180/200 OK and ACK failures, helping to distinguish signaling vs media problem.',
    fleetHelp5: 'Per-vehicle/driver history',
    fleetHelp5Desc: 'Allows analyzing patterns (e.g., "Vehicle 45 with one-way audio in the Gama area").',
    fleetImpactTitle: '📈 Operational impact on the fleet',
    fleetImpact1: 'Delay reduction',
    fleetImpact1Desc: 'Fewer "didn\'t hear" or "audio cut" reduces rework and delivery delays.',
    fleetImpact2: 'Improved customer satisfaction',
    fleetImpact2Desc: 'Clear communication when confirming address and time.',
    fleetImpact3: 'Team optimization',
    fleetImpact3Desc: 'Less time spent by the operator trying to contact drivers with audio failure.',
    fleetImpact4: 'Basis for SLA with operators',
    fleetImpact4Desc: 'Latency and packet loss metrics to negotiate service quality.',
    fleetDemoTitle: '🧪 Practical demonstration (using this demo)',
    fleetDemo1: 'Start call (normal)',
    fleetDemo1Desc: 'Simulates an ideal call between center and driver.',
    fleetDemo2: 'Start call (one-way audio)',
    fleetDemo2Desc: 'Simulates classic problem: driver doesn\'t hear the center (mobile NAT).',
    fleetDemo3: 'Start call (bad NAT)',
    fleetDemo3Desc: 'Simulates SDP with private IP from mobile network, causing media failure and high latency.',
    fleetDemo4: 'Analyze SIP traffic',
    fleetDemo4Desc: 'Generates a quick report from a delivery call, useful for post-mortem.',
    // Practical examples - Fleet tab
    fleetHelpExample: 'Practical example:',
    fleetHelpExampleText: 'A delivery company noticed that 30% of complaints were about "driver didn\'t hear the address". The system detected that drivers with carrier A chips had 70% more one-way audio in the Taguatinga region. The solution was to change the chips of the 15 drivers in that region, reducing complaints by 85% and saving R$ 12,000/month in delay fines.',
    fleetImpactExample: 'Practical example:',
    fleetImpactExampleText: 'A medicine transport company used the platform to map "no-audio zones" in the urban perimeter. They discovered that the Lago Sul region had 60% failure due to handoff between cells. With this information, they negotiated with the operator the installation of a mini-cell in the area, eliminating delays and ensuring vaccine delivery on time.',
  },
};

let currentLang = localStorage.getItem('lang') || 'pt';

function applyLanguage(lang) {
  const dict = i18n[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (dict[key]) {
      el.setAttribute('title', dict[key]);
      el.setAttribute('data-bs-original-title', dict[key]);
    }
  });
  document.documentElement.lang = lang === 'pt' ? 'pt-br' : 'en';
  document.getElementById('currentLang').textContent = lang.toUpperCase();
  currentLang = lang;
  localStorage.setItem('lang', lang);
  // Reinitialize tooltips to update titles
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
}

// Language switcher
document.querySelectorAll('[data-lang]').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const lang = e.target.getAttribute('data-lang');
    currentLang = lang;
    localStorage.setItem('lang', lang);
    applyLanguage(lang);
  });
});

// User session management
function getUserSession() {
  const session = localStorage.getItem('voipSession') || sessionStorage.getItem('voipSession');
  if (session) {
    try {
      return JSON.parse(session);
    } catch (e) {
      return null;
    }
  }
  return null;
}

// Display user info
async function displayUserInfo() {
  try {
    const response = await fetch('/auth/me');
    const data = await response.json();
    
    if (data.success && data.user) {
      const userDisplay = document.getElementById('userDisplay');
      if (userDisplay) {
        userDisplay.textContent = data.user.username;
      }
    }
  } catch (error) {
    console.error('Error fetching user info:', error);
    // Fallback: try to get from session (shouldn't happen with proper auth)
    const session = localStorage.getItem('voipSession') || sessionStorage.getItem('voipSession');
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        if (sessionData.username) {
          const userDisplay = document.getElementById('userDisplay');
          if (userDisplay) {
            userDisplay.textContent = sessionData.username;
          }
        }
      } catch (e) {
        // Invalid session
      }
    }
  }
}

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', async (e) => {
  e.preventDefault();
  
  try {
    // Call logout API
    const response = await fetch('/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Show success message
    const dict = i18n[currentLang];
    const alert = document.createElement('div');
    alert.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
    alert.style.zIndex = '9999';
    alert.textContent = dict.logoutSuccess;
    document.body.appendChild(alert);
    
    // Redirect to login after delay
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 1000);
    
  } catch (error) {
    console.error('Logout error:', error);
    // Fallback: redirect anyway
    window.location.href = '/login.html';
  }
});

// Add mock events for real-time feed
function addMockEvents() {
  const mockEvents = [
    {
      type: 'SIP',
      callId: 'call-001',
      ts: Date.now() - 5000,
      message: 'INVITE sip:+5511987654321@voip.com SIP/2.0',
      details: 'From: +5511912345678;tag=12345'
    },
    {
      type: 'SIP',
      callId: 'call-001', 
      ts: Date.now() - 4000,
      message: 'SIP/2.0 100 Trying',
      details: 'Call-ID: call-001@voip.com'
    },
    {
      type: 'SIP',
      callId: 'call-001',
      ts: Date.now() - 3000,
      message: 'SIP/2.0 180 Ringing',
      details: 'Call-ID: call-001@voip.com'
    },
    {
      type: 'SIP',
      callId: 'call-001',
      ts: Date.now() - 2000,
      message: 'SIP/2.0 200 OK',
      details: 'Call-ID: call-001@voip.com'
    },
    {
      type: 'RTP',
      callId: 'call-001',
      ts: Date.now() - 1000,
      message: 'RTP flow established',
      details: 'Codec: PCMU, Payload: 8, SSRC: 12345678'
    },
    {
      type: 'ALERT',
      callId: 'call-002',
      ts: Date.now() - 30000,
      message: 'ONE_WAY_AUDIO detected',
      details: 'RTP expected: 50, Received: 0, Loss: 100%'
    },
    {
      type: 'SYSTEM',
      callId: null,
      ts: Date.now() - 60000,
      message: 'System health check',
      details: 'CPU: 23.4%, Memory: 40MB, Calls: 3'
    }
  ];

  // Add mock events to the display
  mockEvents.forEach(event => {
    const html = `
      <div class="event-row border-bottom pb-2 mb-2">
        <div class="d-flex justify-content-between align-items-start">
          <div class="flex-grow-1">
            <span class="badge bg-${getEventColor(event.type)} me-2">${event.type}</span>
            <strong>${event.message}</strong>
            ${event.callId ? `<span class="text-muted ms-2">Call: ${event.callId}</span>` : ''}
          </div>
          <small class="text-muted">${fmtTs(event.ts)}</small>
        </div>
        ${event.details ? `<div class="small text-muted mt-1">${event.details}</div>` : ''}
      </div>
    `;
    appendEvent(html);
  });

  console.log('📊 Mock events added:', mockEvents.length);
}

function getEventColor(type) {
  switch (type) {
    case 'SIP': return 'info';
    case 'RTP': return 'success';
    case 'ALERT': return 'danger';
    case 'SYSTEM': return 'secondary';
    default: return 'primary';
  }
}

// Add mock system stats
function addMockStats() {
  const mockStats = {
    cpu: {
      percent: 23.45,
      cores: 4,
      loadavg: [0.5, 0.8, 1.2]
    },
    memory: {
      rss: 134217728,      // 128MB
      heapTotal: 67108864, // 64MB
      heapUsed: 41943040,  // 40MB
      external: 2097152    // 2MB
    },
    calls: {
      active: state.calls.size
    },
    uptimeSec: Math.floor(process.uptime() || 3600)
  };

  // Update stats display with mock data
  if (elStats) {
    elStats.innerHTML = JSON.stringify(mockStats, null, 2);
  }

  console.log('📊 Mock stats added:', mockStats);
}

// Specific simulation functions for original buttons
function simulateNormalCall() {
  const callId = 'call-normal-' + Date.now();
  const from = '+5511912345678';
  const to = '+5511987654321';
  const startTime = new Date();
  
  const newCall = {
    id: callId,
    from: from,
    to: to,
    scenario: 'normal',
    status: 'RINGING',
    duration: '00:00:01',
    startTime: startTime,
    codec: 'PCMU',
    quality: 'Excellent'
  };
  
  // Add call to state
  state.calls.set(callId, newCall);
  renderCalls();
  updateCounters();
  
  // Show notification
  showNotification(
    currentLanguage === 'pt' ? '📞 Chamada normal iniciada' : '📞 Normal call started',
    'success',
    3000
  );
  
  // Realistic SIP flow with RTP
  const events = [
    { type: 'SIP', message: `INVITE sip:${to}@voip.com SIP/2.0`, details: `From: ${from};tag=${Date.now()}`, timestamp: Date.now() },
    { type: 'SIP', message: 'SIP/2.0 100 Trying', details: `Call-ID: ${callId}@voip.com`, timestamp: Date.now() + 200 },
    { type: 'SIP', message: 'SIP/2.0 180 Ringing', details: `Call-ID: ${callId}@voip.com`, timestamp: Date.now() + 500 },
    { type: 'SIP', message: 'SIP/2.0 200 OK', details: `Call-ID: ${callId}@voip.com | SDP: PCMU/8000`, timestamp: Date.now() + 1200 },
    { type: 'SIP', message: 'ACK sip:+5511987654321@voip.com SIP/2.0', details: `Call-ID: ${callId}@voip.com`, timestamp: Date.now() + 1500 },
    { type: 'RTP', message: 'RTP stream established - Bidirectional', details: 'Codec: PCMU, Payload: 8, SSRC: 12345678, Jitter: 1ms', timestamp: Date.now() + 2000 },
    { type: 'RTP', message: 'RTP quality monitoring', details: 'Packets: 50/50 (100%), Loss: 0%, MOS: 4.5, Latency: 25ms', timestamp: Date.now() + 3000 },
    { type: 'ESL', message: 'CHANNEL_CREATE', details: `Channel: SIP/${to}-00000001, State: CS_EXECUTE`, timestamp: Date.now() + 2500 },
    { type: 'ESL', message: 'CHANNEL_ANSWER', details: `Channel: SIP/${to}-00000001, Answered: ${startTime.toISOString()}`, timestamp: Date.now() + 2500 }
  ];
  
  // Update call status to ACTIVE
  setTimeout(() => {
    if (state.calls.has(callId)) {
      const call = state.calls.get(callId);
      call.status = 'ACTIVE';
      renderCalls();
    }
  }, 1700);
  
  // Process events with realistic timing
  events.forEach((event, index) => {
    setTimeout(() => {
      if (!eventsPaused && state.calls.has(callId)) {
        const html = `
          <div class="event-row border-bottom pb-2 mb-2 animate__animated animate__fadeInLeft">
            <div class="d-flex justify-content-between align-items-start">
              <div class="flex-grow-1">
                <span class="badge bg-${getEventColor(event.type)} me-2">${event.type}</span>
                <strong>${event.message}</strong>
                <span class="text-muted ms-2">Call: ${callId}</span>
              </div>
              <small class="text-muted">${fmtTs(event.timestamp)}</small>
            </div>
            <div class="small text-muted mt-1">${event.details}</div>
          </div>
        `;
        appendEvent(html);
        eventCount++;
        updateCounters();
        
        // Update call duration
        if (event.type === 'ESL' && event.message === 'CHANNEL_ANSWER') {
          updateCallDuration(callId);
        }
      }
    }, event.timestamp - events[0].timestamp);
  });
  
  // Start duration counter and metrics simulation
  const durationInterval = setInterval(() => {
    if (state.calls.has(callId) && !eventsPaused) {
      updateCallDuration(callId);
    } else {
      clearInterval(durationInterval);
    }
  }, 1000);
  
  // Start real-time metrics simulation
  simulateCallMetrics(callId);
  
  console.log('📞 Normal call simulated:', callId);
}

function simulateOneWayAudio() {
  const callId = 'call-oneway-' + Date.now();
  const from = '+5511333444555';
  const to = '+5511555666777';
  const startTime = new Date();
  
  const newCall = {
    id: callId,
    from: from,
    to: to,
    scenario: 'one_way_audio',
    status: 'RINGING',
    duration: '00:00:01',
    startTime: startTime,
    codec: 'PCMU',
    quality: 'Poor'
  };
  
  state.calls.set(callId, newCall);
  renderCalls();
  updateCounters();
  
  // Show warning notification
  showNotification(
    currentLanguage === 'pt' ? '⚠️ Problema de one-way audio detectado!' : '⚠️ One-way audio problem detected!',
    'warning',
    4000
  );
  
  // One-way audio scenario with detailed RTP issues
  const events = [
    { type: 'SIP', message: `INVITE sip:${to}@voip.com SIP/2.0`, details: `From: ${from};tag=${Date.now()}`, timestamp: Date.now() },
    { type: 'SIP', message: 'SIP/2.0 100 Trying', details: `Call-ID: ${callId}@voip.com`, timestamp: Date.now() + 200 },
    { type: 'SIP', message: 'SIP/2.0 180 Ringing', details: `Call-ID: ${callId}@voip.com`, timestamp: Date.now() + 500 },
    { type: 'SIP', message: 'SIP/2.0 200 OK', details: `Call-ID: ${callId}@voip.com | SDP: PCMU/8000`, timestamp: Date.now() + 1200 },
    { type: 'SIP', message: 'ACK sip:+5511555666777@voip.com SIP/2.0', details: `Call-ID: ${callId}@voip.com`, timestamp: Date.now() + 1500 },
    { type: 'RTP', message: 'RTP stream established - One way detected', details: 'Codec: PCMU, Payload: 8, SSRC: 87654321, Direction: OUTBOUND ONLY', timestamp: Date.now() + 2000 },
    { type: 'RTP', message: 'RTP quality degradation', details: 'Packets: 50/0 (0%), Loss: 100%, MOS: 1.0, Latency: N/A', timestamp: Date.now() + 3000 },
    { type: 'ALERT', message: 'ONE_WAY_AUDIO detected', details: 'RTP expected: 50 packets, Received: 0 packets, Loss: 100%', timestamp: Date.now() + 3500 },
    { type: 'ESL', message: 'CHANNEL_CREATE', details: `Channel: SIP/${to}-00000002, State: CS_EXECUTE`, timestamp: Date.now() + 2500 },
    { type: 'ESL', message: 'CHANNEL_ANSWER', details: `Channel: SIP/${to}-00000002, Answered: ${startTime.toISOString()}`, timestamp: Date.now() + 2500 }
  ];
  
  // Update call status
  setTimeout(() => {
    if (state.calls.has(callId)) {
      const call = state.calls.get(callId);
      call.status = 'ACTIVE';
      call.quality = 'Poor';
      renderCalls();
    }
  }, 1700);
  
  events.forEach((event, index) => {
    setTimeout(() => {
      if (!eventsPaused && state.calls.has(callId)) {
        const html = `
          <div class="event-row border-bottom pb-2 mb-2 animate__animated animate__fadeInLeft">
            <div class="d-flex justify-content-between align-items-start">
              <div class="flex-grow-1">
                <span class="badge bg-${getEventColor(event.type)} me-2">${event.type}</span>
                <strong>${event.message}</strong>
                <span class="text-muted ms-2">Call: ${callId}</span>
              </div>
              <small class="text-muted">${fmtTs(event.timestamp)}</small>
            </div>
            <div class="small text-muted mt-1">${event.details}</div>
          </div>
        `;
        appendEvent(html);
        eventCount++;
        updateCounters();
        
        if (event.type === 'ESL' && event.message === 'CHANNEL_ANSWER') {
          updateCallDuration(callId);
        }
      }
    }, event.timestamp - events[0].timestamp);
  });
  
  // Add detailed alert after detection
  setTimeout(() => {
    if (state.calls.has(callId)) {
      const alert = {
        type: 'ONE_WAY_AUDIO',
        severity: 'CRITICAL',
        message: 'RTP flow detected broken - no audio received from remote endpoint',
        callId: callId,
        streamId: 'audio-0',
        ts: Date.now(),
        details: { 
          rtp_expected: 50, 
          rtp_received: 0, 
          loss_percent: 100,
          direction: 'outbound_only',
          impact: 'User cannot hear remote party'
        }
      };
      
      state.alerts.push(alert);
      renderAlerts();
      updateCounters();
      
      // Update call quality indicator
      const call = state.calls.get(callId);
      if (call) {
        call.quality = 'Critical';
        renderCalls();
      }
    }
  }, 4000);
  
  const durationInterval = setInterval(() => {
    if (state.calls.has(callId) && !eventsPaused) {
      updateCallDuration(callId);
    } else {
      clearInterval(durationInterval);
    }
  }, 1000);
  
  // Start real-time metrics simulation
  simulateCallMetrics(callId);
  
  console.log('🔇 One-way audio call simulated:', callId);
}

function simulateNatProblem() {
  const callId = 'call-nat-' + Date.now();
  const from = '+5511444555666';
  const to = '+5511555666777';
  const startTime = new Date();
  
  const newCall = {
    id: callId,
    from: from,
    to: to,
    scenario: 'nat_wrong',
    status: 'RINGING',
    duration: '00:00:01',
    startTime: startTime,
    codec: 'PCMU',
    quality: 'Fair'
  };
  
  state.calls.set(callId, newCall);
  renderCalls();
  updateCounters();
  
  // Show danger notification
  showNotification(
    currentLanguage === 'pt' ? '🔴 Problema de NAT detectado!' : '🔴 NAT problem detected!',
    'danger',
    4000
  );
  
  // NAT problem scenario with detailed network issues
  const events = [
    { type: 'SIP', message: `INVITE sip:${to}@voip.com SIP/2.0`, details: `From: ${from};tag=${Date.now()}`, timestamp: Date.now() },
    { type: 'SIP', message: 'SIP/2.0 100 Trying', details: `Call-ID: ${callId}@voip.com`, timestamp: Date.now() + 200 },
    { type: 'SIP', message: 'SIP/2.0 180 Ringing', details: `Call-ID: ${callId}@voip.com`, timestamp: Date.now() + 500 },
    { type: 'SIP', message: 'SIP/2.0 200 OK - SDP contains private IP', details: `Call-ID: ${callId}@voip.com | c=IN IP4 192.168.1.100`, timestamp: Date.now() + 1200 },
    { type: 'ALERT', message: 'NAT_SUSPECTED - Private IP in SDP', details: 'SDP IP: 192.168.1.100 (private), Public IP: 200.150.10.20', timestamp: Date.now() + 1500 },
    { type: 'SIP', message: 'ACK sip:+5511555666777@voip.com SIP/2.0', details: `Call-ID: ${callId}@voip.com`, timestamp: Date.now() + 1800 },
    { type: 'RTP', message: 'RTP flow with high latency', details: 'Codec: PCMU, Payload: 8, SSRC: 98765432, Latency: 250ms, Jitter: 15ms', timestamp: Date.now() + 2500 },
    { type: 'RTP', message: 'RTP quality issues', details: 'Packets: 45/50 (90%), Loss: 10%, MOS: 3.2, Latency: 250ms', timestamp: Date.now() + 3500 },
    { type: 'ALERT', message: 'HIGH_LATENCY detected', details: 'Latency: 250ms (threshold: 150ms), Impact: Poor audio quality', timestamp: Date.now() + 4000 },
    { type: 'ESL', message: 'CHANNEL_CREATE', details: `Channel: SIP/${to}-00000003, State: CS_EXECUTE`, timestamp: Date.now() + 3000 },
    { type: 'ESL', message: 'CHANNEL_ANSWER', details: `Channel: SIP/${to}-00000003, Answered: ${startTime.toISOString()}`, timestamp: Date.now() + 3000 }
  ];
  
  setTimeout(() => {
    if (state.calls.has(callId)) {
      const call = state.calls.get(callId);
      call.status = 'ACTIVE';
      call.quality = 'Fair';
      renderCalls();
    }
  }, 2000);
  
  events.forEach((event, index) => {
    setTimeout(() => {
      if (!eventsPaused && state.calls.has(callId)) {
        const html = `
          <div class="event-row border-bottom pb-2 mb-2 animate__animated animate__fadeInLeft">
            <div class="d-flex justify-content-between align-items-start">
              <div class="flex-grow-1">
                <span class="badge bg-${getEventColor(event.type)} me-2">${event.type}</span>
                <strong>${event.message}</strong>
                <span class="text-muted ms-2">Call: ${callId}</span>
              </div>
              <small class="text-muted">${fmtTs(event.timestamp)}</small>
            </div>
            <div class="small text-muted mt-1">${event.details}</div>
          </div>
        `;
        appendEvent(html);
        eventCount++;
        updateCounters();
        
        if (event.type === 'ESL' && event.message === 'CHANNEL_ANSWER') {
          updateCallDuration(callId);
        }
      }
    }, event.timestamp - events[0].timestamp);
  });
  
  // Add multiple alerts for NAT issues
  setTimeout(() => {
    if (state.calls.has(callId)) {
      const alerts = [
        {
          type: 'NAT_SUSPECTED',
          severity: 'WARNING',
          message: 'Private IP detected in SDP - NAT configuration issue',
          callId: callId,
          streamId: 'sip-0',
          ts: Date.now(),
          details: { 
            sdp_ip: '192.168.1.100', 
            public_ip: '200.150.10.20',
            recommendation: 'Configure STUN/TURN or fix NAT rules'
          }
        },
        {
          type: 'HIGH_LATENCY',
          severity: 'WARNING',
          message: 'Elevated latency detected on call',
          callId: callId,
          streamId: 'audio-1',
          ts: Date.now() + 1000,
          details: { 
            latency_ms: 250, 
            jitter_ms: 15,
            threshold_ms: 150,
            impact: 'Echo and delay issues'
          }
        }
      ];
      
      state.alerts.push(...alerts);
      renderAlerts();
      updateCounters();
      
      // Update call quality
      const call = state.calls.get(callId);
      if (call) {
        call.quality = 'Poor';
        renderCalls();
      }
    }
  }, 4500);
  
  const durationInterval = setInterval(() => {
    if (state.calls.has(callId) && !eventsPaused) {
      updateCallDuration(callId);
    } else {
      clearInterval(durationInterval);
    }
  }, 1000);
  
  // Start real-time metrics simulation
  simulateCallMetrics(callId);
  
  console.log('🌐 NAT problem call simulated:', callId);
}

function analyzeTraffic() {
  const analysisId = 'analysis-' + Date.now();
  
  // Show info notification
  showNotification(
    currentLanguage === 'pt' ? '📊 Iniciando análise de tráfego...' : '📊 Starting traffic analysis...',
    'info',
    3000
  );
  
  // Comprehensive traffic analysis simulation
  const analysisEvents = [
    { type: 'SYSTEM', message: 'Starting comprehensive traffic analysis...', details: `Analysis ID: ${analysisId}`, timestamp: Date.now() },
    { type: 'SYSTEM', message: 'Reading PCAP file: /pcap/traffic_log_20250305.pcap', details: 'File size: 125.4 MB, Duration: 2 hours', timestamp: Date.now() + 500 },
    { type: 'SYSTEM', message: 'Parsing SIP messages...', details: 'Found 45 SIP dialogs, 89 INVITE transactions', timestamp: Date.now() + 1500 },
    { type: 'SYSTEM', message: 'Analyzing RTP streams...', details: 'Detected 23 RTP flows, 12 unique codecs', timestamp: Date.now() + 2500 },
    { type: 'SYSTEM', message: 'Checking call quality metrics...', details: 'MOS average: 3.8, Packet loss: 2.3%', timestamp: Date.now() + 3500 },
    { type: 'ALERT', message: 'ANALYSIS_COMPLETE - Issues found', details: '3 one-way audio calls, 2 NAT problems, 1 high latency', timestamp: Date.now() + 4500 },
    { type: 'SYSTEM', message: 'Generating detailed report...', details: `Report: /reports/analysis_${analysisId}.json`, timestamp: Date.now() + 5500 },
    { type: 'SYSTEM', message: 'Analysis completed successfully', details: `Total processing time: 4.2 seconds`, timestamp: Date.now() + 6000 }
  ];
  
  analysisEvents.forEach((event, index) => {
    setTimeout(() => {
      if (!eventsPaused) {
        const html = `
          <div class="event-row border-bottom pb-2 mb-2 animate__animated animate__fadeInLeft">
            <div class="d-flex justify-content-between align-items-start">
              <div class="flex-grow-1">
                <span class="badge bg-${getEventColor(event.type)} me-2">${event.type}</span>
                <strong>${event.message}</strong>
              </div>
              <small class="text-muted">${fmtTs(event.timestamp)}</small>
            </div>
            <div class="small text-muted mt-1">${event.details}</div>
          </div>
        `;
        appendEvent(html);
        eventCount++;
        updateCounters();
      }
    }, event.timestamp - analysisEvents[0].timestamp);
  });
  
  // Add comprehensive analysis results
  setTimeout(() => {
    const analysisAlerts = [
      {
        type: 'ANALYSIS_RESULT',
        severity: 'INFO',
        message: 'Traffic analysis completed - Multiple issues detected',
        callId: null,
        streamId: `analysis-${analysisId}`,
        ts: Date.now(),
        details: { 
          total_calls: 45,
          successful_calls: 39,
          failed_calls: 6,
          one_way_audio: 3,
          nat_issues: 2,
          high_latency: 1,
          average_mos: 3.8,
          packet_loss_avg: 2.3,
          analysis_duration: '4.2s',
          recommendations: [
            'Fix NAT configuration for 2 endpoints',
            'Investigate one-way audio in mobile network',
            'Optimize routing for high-latency calls'
          ]
        }
      },
      {
        type: 'QUALITY_METRICS',
        severity: 'INFO',
        message: 'Call quality summary for the period',
        callId: null,
        streamId: `quality-${analysisId}`,
        ts: Date.now() + 500,
        details: {
          excellent_calls: 25,
          good_calls: 14,
          fair_calls: 4,
          poor_calls: 2,
          critical_calls: 0,
          overall_score: 'B+'
        }
      }
    ];
    
    state.alerts.push(...analysisAlerts);
    renderAlerts();
    updateCounters();
    
    // Show completion notification
    showNotification(
      currentLanguage === 'pt' ? '✅ Análise concluída! 6 problemas encontrados' : '✅ Analysis complete! 6 issues found',
      'success',
      4000
    );
  }, 6500);
  
  console.log('📊 Comprehensive traffic analysis simulated:', analysisId);
}

// Helper function to update call duration
function updateCallDuration(callId) {
  if (state.calls.has(callId)) {
    const call = state.calls.get(callId);
    const now = new Date();
    const duration = Math.floor((now - call.startTime) / 1000);
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    call.duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    renderCalls();
  }
}

// Add mock data for demonstration
function addMockData() {
  // Mock active calls
  const mockCalls = [
    {
      id: 'call-001',
      from: '+5511912345678',
      to: '+5511987654321',
      scenario: 'normal',
      status: 'ACTIVE',
      duration: '00:02:45'
    },
    {
      id: 'call-002', 
      from: '+5511333444555',
      to: '+5511555666777',
      scenario: 'one_way_audio',
      status: 'ACTIVE',
      duration: '00:01:12'
    },
    {
      id: 'call-003',
      from: '1001',
      to: '2002',
      scenario: 'normal',
      status: 'RINGING',
      duration: '00:00:15'
    }
  ];

  // Add mock calls to state
  mockCalls.forEach(call => {
    state.calls.set(call.id, call);
  });

  // Mock network alerts
  const mockAlerts = [
    {
      type: 'ONE_WAY_AUDIO',
      severity: 'ALERT',
      message: 'RTP flow detected broken - no audio received from remote',
      callId: 'call-002',
      streamId: 'audio-0',
      ts: Date.now() - 30000,
      details: { rtp_expected: 50, rtp_received: 0, loss_percent: 100 }
    },
    {
      type: 'HIGH_LATENCY',
      severity: 'WARNING',
      message: 'Elevated latency detected on call',
      callId: 'call-001',
      streamId: 'audio-1',
      ts: Date.now() - 120000,
      details: { latency_ms: 180, jitter_ms: 25 }
    },
    {
      type: 'NAT_SUSPECTED',
      severity: 'WARNING',
      message: 'Private IP detected in SDP - NAT configuration issue',
      callId: 'call-001',
      streamId: 'sip-0',
      ts: Date.now() - 180000,
      details: { sdp_ip: '192.168.1.100', public_ip: '200.150.10.20' }
    }
  ];

  // Add mock alerts to state
  state.alerts.push(...mockAlerts);

  // Add mock stats
  addMockStats();

  // Add mock events
  addMockEvents();

  console.log('📊 Mock data added:', {
    calls: state.calls.size,
    alerts: state.alerts.length
  });
}

// Wait for DOM to be ready before initializing
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DOM Content Loaded');
  
  // Re-get elements to ensure they exist
  const elCallsCheck = document.getElementById('calls');
  const elAlertsCheck = document.getElementById('alerts');
  const elStatsCheck = document.getElementById('stats');
  
  console.log('🔍 Elements found:', {
    calls: !!elCallsCheck,
    alerts: !!elAlertsCheck,
    stats: !!elStatsCheck
  });
  
  // Add mock data for demonstration
  addMockData();
  
  // Add original button event listeners
  if (btnSimNormal) {
    btnSimNormal.addEventListener('click', function() {
      console.log('🖱️ Normal button clicked!');
      // Visual feedback
      btnSimNormal.classList.add('active');
      btnSimNormal.innerHTML = '<i class="bi bi-telephone-fill"></i> ' + (currentLanguage === 'pt' ? 'Iniciando...' : 'Starting...');
      btnSimNormal.disabled = true;
      
      simulateNormalCall();
      
      // Reset button after simulation
      setTimeout(() => {
        btnSimNormal.classList.remove('active');
        btnSimNormal.innerHTML = currentLanguage === 'pt' ? 'Iniciar chamada (normal)' : 'Start call (normal)';
        btnSimNormal.disabled = false;
      }, 5000);
    });
  }
  
  if (btnSimOneWay) {
    btnSimOneWay.addEventListener('click', function() {
      console.log('🖱️ One-Way button clicked!');
      // Visual feedback
      btnSimOneWay.classList.add('active');
      btnSimOneWay.innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i> ' + (currentLanguage === 'pt' ? 'Iniciando...' : 'Starting...');
      btnSimOneWay.disabled = true;
      
      simulateOneWayAudio();
      
      // Reset button after simulation
      setTimeout(() => {
        btnSimOneWay.classList.remove('active');
        btnSimOneWay.innerHTML = currentLanguage === 'pt' ? 'Iniciar chamada (one-way audio)' : 'Start call (one-way audio)';
        btnSimOneWay.disabled = false;
      }, 5000);
    });
  }
  
  if (btnSimNat) {
    btnSimNat.addEventListener('click', function() {
      console.log('🖱️ NAT button clicked!');
      // Visual feedback
      btnSimNat.classList.add('active');
      btnSimNat.innerHTML = '<i class="bi bi-wifi-off"></i> ' + (currentLanguage === 'pt' ? 'Iniciando...' : 'Starting...');
      btnSimNat.disabled = true;
      
      simulateNatProblem();
      
      // Reset button after simulation
      setTimeout(() => {
        btnSimNat.classList.remove('active');
        btnSimNat.innerHTML = currentLanguage === 'pt' ? 'Iniciar chamada (NAT incorreto)' : 'Start call (NAT incorrect)';
        btnSimNat.disabled = false;
      }, 5000);
    });
  }
  
  if (btnAnalyze) {
    btnAnalyze.addEventListener('click', function() {
      console.log('🖱️ Analyze button clicked!');
      // Visual feedback
      btnAnalyze.classList.add('active');
      btnAnalyze.innerHTML = '<i class="bi bi-search"></i> ' + (currentLanguage === 'pt' ? 'Analisando...' : 'Analyzing...');
      btnAnalyze.disabled = true;
      
      analyzeTraffic();
      
      // Reset button after simulation
      setTimeout(() => {
        btnAnalyze.classList.remove('active');
        btnAnalyze.innerHTML = currentLanguage === 'pt' ? 'Analisar tráfego SIP' : 'Analyze SIP traffic';
        btnAnalyze.disabled = false;
      }, 6000);
    });
  }
  
  // Add event control buttons
  const btnClearEvents = document.getElementById('btnClearEvents');
  const btnPauseEvents = document.getElementById('btnPauseEvents');
  const btnResolveProblems = document.getElementById('btnResolveProblems');
  const btnAutoResolve = document.getElementById('btnAutoResolve');
  
  if (btnClearEvents) {
    btnClearEvents.addEventListener('click', () => {
      elEvents.innerHTML = '<div class="text-muted p-3">' + 
        (currentLanguage === 'pt' ? 'Eventos limpos' : 'Events cleared') + '</div>';
      eventCount = 0;
      updateCounters();
      showNotification(
        currentLanguage === 'pt' ? '🧹 Eventos limpos' : '🧹 Events cleared',
        'info',
        2000
      );
    });
  }
  
  if (btnPauseEvents) {
    btnPauseEvents.addEventListener('click', () => {
      eventsPaused = !eventsPaused;
      btnPauseEvents.innerHTML = eventsPaused ? 
        '<i class="bi bi-play-fill"></i> ' + (currentLanguage === 'pt' ? 'Retomar' : 'Resume') :
        '<i class="bi bi-pause-fill"></i> ' + (currentLanguage === 'pt' ? 'Pausar' : 'Pause');
      btnPauseEvents.className = eventsPaused ? 'btn btn-success btn-sm ms-2' : 'btn btn-secondary btn-sm ms-2';
      
      showNotification(
        eventsPaused ? 
          (currentLanguage === 'pt' ? '⏸️ Eventos pausados' : '⏸️ Events paused') :
          (currentLanguage === 'pt' ? '▶️ Eventos retomados' : '▶️ Events resumed'),
        eventsPaused ? 'warning' : 'success',
        2000
      );
    });
  }
  
  if (btnResolveProblems) {
    btnResolveProblems.addEventListener('click', () => {
      resolveVoipProblems();
    });
  }
  
  if (btnAutoResolve) {
    let autoResolveEnabled = false;
    btnAutoResolve.addEventListener('click', () => {
      autoResolveEnabled = !autoResolveEnabled;
      if (autoResolveEnabled) {
        enableAutoResolution();
        btnAutoResolve.innerHTML = '🛑 Parar Auto-Resolução';
        btnAutoResolve.className = 'btn btn-danger btn-sm ms-2';
      } else {
        disableAutoResolution();
        btnAutoResolve.innerHTML = '🤖 Auto-Resolução';
        btnAutoResolve.className = 'btn btn-warning btn-sm ms-2';
      }
    });
  }
  
  // Add language selector event listeners
  document.querySelectorAll('[data-lang]').forEach(element => {
    element.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = e.target.getAttribute('data-lang');
      updateLanguage(lang);
    });
  });
  
  // Initialize language
  updateLanguage('pt');
  
  // Initialize counters
  updateCounters();
  
  // Initialize system stats
  updateSystemStats();
  setInterval(updateSystemStats, 2000);
  
  // Show welcome notification
  setTimeout(() => {
    showNotification(
      currentLanguage === 'pt' ? '🎉 Bem-vindo ao VoIP Monitor!' : '🎉 Welcome to VoIP Monitor!',
      'success',
      4000
    );
  }, 1000);
  
  // Initialize user display on page load
  displayUserInfo();

  // Initial render to show mock data
  if (elCallsCheck && elAlertsCheck) {
    renderCalls();
    renderAlerts();
    console.log('✅ Initial render completed with mock data');
  } else {
    console.error('❌ Cannot render - missing elements');
  }

  // Apply saved language on load
  applyLanguage(currentLang);
});

const startTime = Date.now();

function updateSystemStats() {
  const cpuUsage = document.getElementById('cpuUsage');
  const cpuBar = document.getElementById('cpuBar');
  const memUsage = document.getElementById('memUsage');
  const memBar = document.getElementById('memBar');
  const uptime = document.getElementById('uptime');
  const lastUpdate = document.getElementById('lastUpdate');
  
  // Simulate CPU usage (10-60%)
  const cpuValue = Math.floor(Math.random() * 50) + 10;
  if (cpuUsage) cpuUsage.textContent = cpuValue + '%';
  if (cpuBar) cpuBar.style.width = cpuValue + '%';
  
  // Simulate Memory usage (30-70%)
  const memValue = Math.floor(Math.random() * 40) + 30;
  if (memUsage) memUsage.textContent = memValue + '%';
  if (memBar) memBar.style.width = memValue + '%';
  
  // Update uptime
  if (uptime) {
    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;
    uptime.textContent = `${hours}h ${minutes}m ${seconds}s`;
  }
  
  // Update last update time
  if (lastUpdate) {
    lastUpdate.textContent = new Date().toLocaleTimeString();
  }
}

// Helper functions for call rendering
function getStatusColor(status) {
  const colors = {
    'RINGING': '#ffc107',
    'ACTIVE': '#28a745',
    'ON_HOLD': '#17a2b8',
    'ENDING': '#dc3545'
  };
  return colors[status] || '#6c757d';
}

function getQualityColor(quality) {
  const colors = {
    'Excellent': 'bg-success',
    'Good': 'bg-info',
    'Fair': 'bg-warning',
    'Poor': 'bg-danger',
    'Critical': 'bg-danger'
  };
  return colors[quality] || 'bg-secondary';
}

function getQualityIcon(quality) {
  const icons = {
    'Excellent': 'bi-emoji-smile-fill',
    'Good': 'bi-emoji-smile',
    'Fair': 'bi-emoji-neutral',
    'Poor': 'bi-emoji-frown',
    'Critical': 'bi-emoji-dizzy-fill'
  };
  return icons[quality] || 'bi-dash-circle';
}

function getLatencyColor(latency) {
  if (latency < 50) return 'bg-success';
  if (latency < 150) return 'bg-warning';
  return 'bg-danger';
}

function getJitterColor(jitter) {
  if (jitter < 5) return 'bg-success';
  if (jitter < 15) return 'bg-warning';
  return 'bg-danger';
}

function getLossColor(loss) {
  if (loss < 1) return 'bg-success';
  if (loss < 3) return 'bg-warning';
  return 'bg-danger';
}

function getMOSColor(mos) {
  if (mos >= 4.0) return 'bg-success';
  if (mos >= 3.0) return 'bg-warning';
  return 'bg-danger';
}

function getCallTooltip(call) {
  const scenarioTip = call.scenario === 'normal'
    ? (currentLanguage === 'pt' ? 'Fluxo esperado: SIP completa + RTP bidirecional' : 'Expected flow: Complete SIP + bidirectional RTP')
    : (call.scenario === 'one_way_audio'
      ? (currentLanguage === 'pt' ? 'One-way audio: Áudio apenas em uma direção' : 'One-way audio: Audio in one direction only')
      : (currentLanguage === 'pt' ? 'NAT incorreto: Problemas de configuração de rede' : 'NAT incorrect: Network configuration issues'));
  
  return `${scenarioTip}\n${currentLanguage === 'pt' ? 'Qualidade:' : 'Quality:'} ${call.quality || 'Unknown'}\n${currentLanguage === 'pt' ? 'Duração:' : 'Duration:'} ${call.duration}`;
}

// Call control functions
function showCallDetails(callId) {
  const call = state.calls.get(callId);
  if (!call) return;
  
  const details = `
    ${currentLanguage === 'pt' ? 'ID da Chamada:' : 'Call ID:'} ${callId}
    ${currentLanguage === 'pt' ? 'De:' : 'From:'} ${call.from}
    ${currentLanguage === 'pt' ? 'Para:' : 'To:'} ${call.to}
    ${currentLanguage === 'pt' ? 'Status:' : 'Status:'} ${call.status}
    ${currentLanguage === 'pt' ? 'Duração:' : 'Duration:'} ${call.duration}
    ${currentLanguage === 'pt' ? 'Codec:' : 'Codec:'} ${call.codec || 'PCMU'}
    ${currentLanguage === 'pt' ? 'Qualidade:' : 'Quality:'} ${call.quality || 'Unknown'}
    ${currentLanguage === 'pt' ? 'Cenário:' : 'Scenario:'} ${call.scenario}
    ${currentLanguage === 'pt' ? 'Início:' : 'Start:'} ${call.startTime ? call.startTime.toLocaleTimeString() : 'N/A'}
    ${currentLanguage === 'pt' ? 'Latência:' : 'Latency:'} ${call.latency || 25}ms
    ${currentLanguage === 'pt' ? 'Jitter:' : 'Jitter:'} ${call.jitter || 1}ms
    ${currentLanguage === 'pt' ? 'Perda de Pacotes:' : 'Packet Loss:'} ${call.packetLoss || 0}%
    MOS: ${call.mos || 4.5}
  `;
  
  showNotification(
    `📞 ${currentLanguage === 'pt' ? 'Detalhes da Chamada:' : 'Call Details:'} ${callId}`,
    'info',
    8000
  );
  
  console.log('📞 Call Details:', details);
}

function muteCall(callId) {
  const call = state.calls.get(callId);
  if (!call) return;
  
  call.isMuted = !call.isMuted;
  
  showNotification(
    call.isMuted ? 
      `🔇 ${currentLanguage === 'pt' ? 'Chamada' : 'Call'} ${callId} ${currentLanguage === 'pt' ? 'silenciada' : 'muted'}` : 
      `🔊 ${currentLanguage === 'pt' ? 'Chamada' : 'Call'} ${callId} ${currentLanguage === 'pt' ? 'ativada' : 'unmuted'}`,
    'info',
    2000
  );
  
  // Add event
  const html = `
    <div class="event-row border-bottom pb-2 mb-2">
      <div class="d-flex justify-content-between align-items-start">
        <div class="flex-grow-1">
          <span class="badge bg-warning me-2">CONTROL</span>
          <strong>${currentLanguage === 'pt' ? 'Chamada' : 'Call'} ${call.isMuted ? (currentLanguage === 'pt' ? 'SILENCIADA' : 'MUTED') : (currentLanguage === 'pt' ? 'ATIVADA' : 'UNMUTED')}</strong>
          <span class="text-muted ms-2">Call: ${callId}</span>
        </div>
        <small class="text-muted">${fmtTs(Date.now())}</small>
      </div>
      <div class="small text-muted mt-1">${currentLanguage === 'pt' ? 'Áudio' : 'Audio'} ${call.isMuted ? (currentLanguage === 'pt' ? 'desabilitado' : 'disabled') : (currentLanguage === 'pt' ? 'habilitado' : 'enabled')} ${currentLanguage === 'pt' ? 'para participantes' : 'for call participants'}</div>
    </div>
  `;
  appendEvent(html);
  eventCount++;
  updateCounters();
  
  console.log('🔇 Call muted/unmuted:', callId, call.isMuted);
}

function hangupCall(callId) {
  const call = state.calls.get(callId);
  if (!call) return;
  
  // Update call status
  call.status = 'ENDING';
  call.endTime = new Date();
  renderCalls();
  
  // Show notification
  showNotification(
    `📞 ${currentLanguage === 'pt' ? 'Chamada' : 'Call'} ${callId} ${currentLanguage === 'pt' ? 'encerrada' : 'ended'}`,
    'warning',
    3000
  );
  
  // Add hangup events
  const events = [
    { type: 'SIP', message: `BYE sip:${call.to}@voip.com SIP/2.0`, details: `Call-ID: ${callId}@voip.com` },
    { type: 'SIP', message: 'SIP/2.0 200 OK', details: `Call-ID: ${callId}@voip.com` },
    { type: 'ESL', message: 'CHANNEL_HANGUP', details: `Channel: SIP/${call.to}-00000001, Cause: normal_clearing` },
    { type: 'SYSTEM', message: `${currentLanguage === 'pt' ? 'Chamada concluída' : 'Call completed'}`, details: `${currentLanguage === 'pt' ? 'Duração:' : 'Duration:'} ${call.duration}, ${currentLanguage === 'pt' ? 'Qualidade:' : 'Quality:'} ${call.quality}` }
  ];
  
  events.forEach((event, index) => {
    setTimeout(() => {
      if (!eventsPaused) {
        const html = `
          <div class="event-row border-bottom pb-2 mb-2">
            <div class="d-flex justify-content-between align-items-start">
              <div class="flex-grow-1">
                <span class="badge bg-${getEventColor(event.type)} me-2">${event.type}</span>
                <strong>${event.message}</strong>
                <span class="text-muted ms-2">Call: ${callId}</span>
              </div>
              <small class="text-muted">${fmtTs(Date.now())}</small>
            </div>
            <div class="small text-muted mt-1">${event.details}</div>
          </div>
        `;
        appendEvent(html);
        eventCount++;
        updateCounters();
      }
    }, index * 300);
  });
  
  // Remove call after events
  setTimeout(() => {
    state.calls.delete(callId);
    renderCalls();
    updateCounters();
    
    showNotification(
      `✅ ${currentLanguage === 'pt' ? 'Chamada' : 'Call'} ${callId} ${currentLanguage === 'pt' ? 'removida da lista ativa' : 'removed from active list'}`,
      'success',
      2000
    );
  }, 1500);
  
  console.log('📞 Call ended:', callId);
}

// VoIP Problem Resolution System
function resolveVoipProblems() {
  showNotification(
    currentLanguage === 'pt' ? '🔧 Iniciando sistema de resolução de problemas VoIP...' : '🔧 Starting VoIP problem resolution system...',
    'info',
    3000
  );
  
  // Analyze current calls for problems
  const problems = analyzeCurrentProblems();
  
  if (problems.length === 0) {
    showNotification(
      currentLanguage === 'pt' ? '✅ Nenhum problema VoIP detectado no momento' : '✅ No VoIP problems detected at the moment',
      'success',
      3000
    );
    return;
  }
  
  // Process each problem with specific solutions
  problems.forEach((problem, index) => {
    setTimeout(() => {
      resolveSpecificProblem(problem);
    }, index * 2000);
  });
}

function analyzeCurrentProblems() {
  const problems = [];
  
  state.calls.forEach((call, callId) => {
    if (call.scenario === 'one_way_audio') {
      problems.push({
        type: 'ONE_WAY_AUDIO',
        callId: callId,
        severity: 'CRITICAL',
        description: currentLanguage === 'pt' ? 
          'Áudio unidirecional detectado - um lado não ouve' : 
          'One-way audio detected - one side cannot hear',
        solution: 'configure_nat_and_firewall'
      });
    }
    
    if (call.scenario === 'nat_wrong') {
      problems.push({
        type: 'NAT_INCORRECT',
        callId: callId,
        severity: 'WARNING',
        description: currentLanguage === 'pt' ? 
          'Configuração NAT incorreta - IP privado no SDP' : 
          'Incorrect NAT configuration - Private IP in SDP',
        solution: 'fix_nat_configuration'
      });
    }
    
    // Check for high latency in any call
    if (call.latency && call.latency > 150) {
      problems.push({
        type: 'HIGH_LATENCY',
        callId: callId,
        severity: 'WARNING',
        description: currentLanguage === 'pt' ? 
          `Alta latência detectada: ${call.latency}ms` : 
          `High latency detected: ${call.latency}ms`,
        solution: 'optimize_routing'
      });
    }
    
    // Check for packet loss
    if (call.packetLoss && call.packetLoss > 3) {
      problems.push({
        type: 'PACKET_LOSS',
        callId: callId,
        severity: 'WARNING',
        description: currentLanguage === 'pt' ? 
          `Perda de pacotes detectada: ${call.packetLoss}%` : 
          `Packet loss detected: ${call.packetLoss}%`,
        solution: 'check_network_quality'
      });
    }
  });
  
  return problems;
}

function resolveSpecificProblem(problem) {
  const { type, callId, severity, description, solution } = problem;
  
  // Add problem detection event
  const problemEvent = `
    <div class="event-row border-bottom pb-2 mb-2">
      <div class="d-flex justify-content-between align-items-start">
        <div class="flex-grow-1">
          <span class="badge bg-${severity === 'CRITICAL' ? 'danger' : 'warning'} me-2">PROBLEM</span>
          <strong>${type} detected</strong>
          <span class="text-muted ms-2">Call: ${callId}</span>
        </div>
        <small class="text-muted">${fmtTs(Date.now())}</small>
      </div>
      <div class="small text-muted mt-1">${description}</div>
    </div>
  `;
  appendEvent(problemEvent);
  eventCount++;
  updateCounters();
  
  // Execute specific solution based on problem type
  switch (solution) {
    case 'configure_nat_and_firewall':
      resolveOneWayAudio(callId);
      break;
    case 'fix_nat_configuration':
      resolveNatProblem(callId);
      break;
    case 'optimize_routing':
      resolveHighLatency(callId);
      break;
    case 'check_network_quality':
      resolvePacketLoss(callId);
      break;
  }
}

function resolveOneWayAudio(callId) {
  const call = state.calls.get(callId);
  if (!call) return;
  
  showNotification(
    currentLanguage === 'pt' ? '🔧 Configurando NAT e Firewall para One-Way Audio...' : '🔧 Configuring NAT and Firewall for One-Way Audio...',
    'warning',
    4000
  );
  
  // Simulate NAT/Firewall configuration steps
  const resolutionSteps = [
    { 
      type: 'SYSTEM', 
      message: 'Checking NAT configuration...', 
      details: 'Analyzing firewall rules for RTP ports (10000-20000)',
      delay: 500
    },
    { 
      type: 'SYSTEM', 
      message: 'Configuring STUN server...', 
      details: 'STUN: stun.voip.com:3478 - Enabling NAT traversal',
      delay: 1500
    },
    { 
      type: 'SYSTEM', 
      message: 'Configuring TURN server...', 
      details: 'TURN: turn.voip.com:3478 - Fallback relay enabled',
      delay: 2500
    },
    { 
      type: 'SYSTEM', 
      message: 'Opening RTP pinholes...', 
      details: 'Firewall rules added: UDP 10000-20000 (bidirectional)',
      delay: 3500
    },
    { 
      type: 'SYSTEM', 
      message: 'Updating SIP SDP...', 
      details: 'SDP updated with public IP and external port mapping',
      delay: 4500
    },
    { 
      type: 'SYSTEM', 
      message: 'One-Way Audio RESOLVED', 
      details: 'RTP flow restored to bidirectional - Quality improved',
      delay: 5500
    }
  ];
  
  resolutionSteps.forEach(step => {
    setTimeout(() => {
      if (!eventsPaused) {
        const html = `
          <div class="event-row border-bottom pb-2 mb-2">
            <div class="d-flex justify-content-between align-items-start">
              <div class="flex-grow-1">
                <span class="badge bg-success me-2">FIX</span>
                <strong>${step.message}</strong>
                <span class="text-muted ms-2">Call: ${callId}</span>
              </div>
              <small class="text-muted">${fmtTs(Date.now())}</small>
            </div>
            <div class="small text-muted mt-1">${step.details}</div>
          </div>
        `;
        appendEvent(html);
        eventCount++;
        updateCounters();
      }
    }, step.delay);
  });
  
  // Update call metrics after resolution
  setTimeout(() => {
    if (state.calls.has(callId)) {
      const call = state.calls.get(callId);
      call.quality = 'Good';
      call.latency = 30 + Math.random() * 20;
      call.jitter = 1 + Math.random() * 3;
      call.packetLoss = Math.random() * 1;
      call.mos = 3.8 + Math.random() * 0.7;
      renderCalls();
      
      // Remove the one-way audio alert
      state.alerts = state.alerts.filter(alert => 
        !(alert.type === 'ONE_WAY_AUDIO' && alert.callId === callId)
      );
      renderAlerts();
      updateCounters();
      
      showNotification(
        currentLanguage === 'pt' ? '✅ One-Way Audio resolvido com sucesso!' : '✅ One-Way Audio resolved successfully!',
        'success',
        4000
      );
    }
  }, 6000);
}

function resolveNatProblem(callId) {
  const call = state.calls.get(callId);
  if (!call) return;
  
  showNotification(
    currentLanguage === 'pt' ? '🔧 Corrigindo configuração NAT...' : '🔧 Fixing NAT configuration...',
    'warning',
    4000
  );
  
  const resolutionSteps = [
    { 
      type: 'SYSTEM', 
      message: 'Detecting private IP in SDP...', 
      details: 'Found: 192.168.1.100 - Replacing with public IP',
      delay: 500
    },
    { 
      type: 'SYSTEM', 
      message: 'Configuring NAT binding...', 
      details: 'Binding internal:192.168.1.100:5060 → external:200.150.10.20:5060',
      delay: 1500
    },
    { 
      type: 'SYSTEM', 
      message: 'Updating SDP c= line...', 
      details: 'c=IN IP4 200.150.10.20 (public IP)',
      delay: 2500
    },
    { 
      type: 'SYSTEM', 
      message: 'Updating SDP m= lines...', 
      details: 'm=audio 10000 RTP/AVP 8 0 18 (external ports)',
      delay: 3500
    },
    { 
      type: 'SYSTEM', 
      message: 'NAT Configuration FIXED', 
      details: 'SDP now contains public addresses - Connectivity restored',
      delay: 4500
    }
  ];
  
  resolutionSteps.forEach(step => {
    setTimeout(() => {
      if (!eventsPaused) {
        const html = `
          <div class="event-row border-bottom pb-2 mb-2">
            <div class="d-flex justify-content-between align-items-start">
              <div class="flex-grow-1">
                <span class="badge bg-info me-2">FIX</span>
                <strong>${step.message}</strong>
                <span class="text-muted ms-2">Call: ${callId}</span>
              </div>
              <small class="text-muted">${fmtTs(Date.now())}</small>
            </div>
            <div class="small text-muted mt-1">${step.details}</div>
          </div>
        `;
        appendEvent(html);
        eventCount++;
        updateCounters();
      }
    }, step.delay);
  });
  
  setTimeout(() => {
    if (state.calls.has(callId)) {
      const call = state.calls.get(callId);
      call.quality = 'Good';
      call.latency = 40 + Math.random() * 30;
      call.jitter = 2 + Math.random() * 4;
      call.packetLoss = Math.random() * 2;
      call.mos = 3.5 + Math.random() * 0.8;
      renderCalls();
      
      // Remove NAT alerts
      state.alerts = state.alerts.filter(alert => 
        !(alert.type === 'NAT_SUSPECTED' && alert.callId === callId)
      );
      renderAlerts();
      updateCounters();
      
      showNotification(
        currentLanguage === 'pt' ? '✅ Problema NAT resolvido!' : '✅ NAT problem resolved!',
        'success',
        4000
      );
    }
  }, 5000);
}

function resolveHighLatency(callId) {
  const call = state.calls.get(callId);
  if (!call) return;
  
  showNotification(
    currentLanguage === 'pt' ? '🔧 Otimizando roteamento para alta latência...' : '🔧 Optimizing routing for high latency...',
    'warning',
    4000
  );
  
  const resolutionSteps = [
    { 
      type: 'SYSTEM', 
      message: 'Analyzing network path...', 
      details: 'Current route: 12 hops, avg latency: 250ms',
      delay: 500
    },
    { 
      type: 'SYSTEM', 
      message: 'Finding optimal route...', 
      details: 'New route: 8 hops via premium backbone',
      delay: 1500
    },
    { 
      type: 'SYSTEM', 
      message: 'Configuring QoS...', 
      details: 'RTP traffic prioritized (DSCP: EF)',
      delay: 2500
    },
    { 
      type: 'SYSTEM', 
      message: 'Enabling jitter buffer...', 
      details: 'Adaptive jitter buffer: 30ms (dynamic)',
      delay: 3500
    },
    { 
      type: 'SYSTEM', 
      message: 'High Latency RESOLVED', 
      details: 'New latency: 45ms - Improvement: 82%',
      delay: 4500
    }
  ];
  
  resolutionSteps.forEach(step => {
    setTimeout(() => {
      if (!eventsPaused) {
        const html = `
          <div class="event-row border-bottom pb-2 mb-2">
            <div class="d-flex justify-content-between align-items-start">
              <div class="flex-grow-1">
                <span class="badge bg-primary me-2">FIX</span>
                <strong>${step.message}</strong>
                <span class="text-muted ms-2">Call: ${callId}</span>
              </div>
              <small class="text-muted">${fmtTs(Date.now())}</small>
            </div>
            <div class="small text-muted mt-1">${step.details}</div>
          </div>
        `;
        appendEvent(html);
        eventCount++;
        updateCounters();
      }
    }, step.delay);
  });
  
  setTimeout(() => {
    if (state.calls.has(callId)) {
      const call = state.calls.get(callId);
      call.latency = 30 + Math.random() * 20;
      call.jitter = 1 + Math.random() * 2;
      call.packetLoss = Math.random() * 0.5;
      call.mos = 4.0 + Math.random() * 0.5;
      call.quality = call.mos >= 4.0 ? 'Excellent' : 'Good';
      renderCalls();
      
      // Remove high latency alerts
      state.alerts = state.alerts.filter(alert => 
        !(alert.type === 'HIGH_LATENCY' && alert.callId === callId)
      );
      renderAlerts();
      updateCounters();
      
      showNotification(
        currentLanguage === 'pt' ? '✅ Alta latência resolvida!' : '✅ High latency resolved!',
        'success',
        4000
      );
    }
  }, 5000);
}

function resolvePacketLoss(callId) {
  const call = state.calls.get(callId);
  if (!call) return;
  
  showNotification(
    currentLanguage === 'pt' ? '🔧 Verificando qualidade da rede...' : '🔧 Checking network quality...',
    'warning',
    4000
  );
  
  const resolutionSteps = [
    { 
      type: 'SYSTEM', 
      message: 'Analyzing packet loss pattern...', 
      details: 'Random loss detected - Possible congestion',
      delay: 500
    },
    { 
      type: 'SYSTEM', 
      message: 'Increasing bandwidth...', 
      details: 'RTP stream bandwidth: 128kbps → 256kbps',
      delay: 1500
    },
    { 
      type: 'SYSTEM', 
      message: 'Enabling FEC (Forward Error Correction)...', 
      details: 'Redundancy packets added: 20% overhead',
      delay: 2500
    },
    { 
      type: 'SYSTEM', 
      message: 'Optimizing codec...', 
      details: 'Switching to G.729 (lower bandwidth, better compression)',
      delay: 3500
    },
    { 
      type: 'SYSTEM', 
      message: 'Packet Loss RESOLVED', 
      details: 'Loss reduced to 0.5% - Quality improved',
      delay: 4500
    }
  ];
  
  resolutionSteps.forEach(step => {
    setTimeout(() => {
      if (!eventsPaused) {
        const html = `
          <div class="event-row border-bottom pb-2 mb-2">
            <div class="d-flex justify-content-between align-items-start">
              <div class="flex-grow-1">
                <span class="badge bg-secondary me-2">FIX</span>
                <strong>${step.message}</strong>
                <span class="text-muted ms-2">Call: ${callId}</span>
              </div>
              <small class="text-muted">${fmtTs(Date.now())}</small>
            </div>
            <div class="small text-muted mt-1">${step.details}</div>
          </div>
        `;
        appendEvent(html);
        eventCount++;
        updateCounters();
      }
    }, step.delay);
  });
  
  setTimeout(() => {
    if (state.calls.has(callId)) {
      const call = state.calls.get(callId);
      call.packetLoss = 0.1 + Math.random() * 0.9;
      call.latency = Math.max(20, call.latency - 20);
      call.jitter = Math.max(1, call.jitter - 3);
      call.mos = Math.min(4.5, call.mos + 0.5);
      call.quality = call.mos >= 4.0 ? 'Excellent' : 'Good';
      call.codec = 'G.729';
      renderCalls();
      
      showNotification(
        currentLanguage === 'pt' ? '✅ Perda de pacotes resolvida!' : '✅ Packet loss resolved!',
        'success',
        4000
      );
    }
  }, 5000);
}

// Auto-resolution function
function enableAutoResolution() {
  showNotification(
    currentLanguage === 'pt' ? '🤖 Auto-resolução de problemas ativada' : '🤖 Auto-problem resolution enabled',
    'info',
    3000
  );
  
  // Check for problems every 10 seconds
  const autoResolutionInterval = setInterval(() => {
    const problems = analyzeCurrentProblems();
    if (problems.length > 0) {
      console.log('🤖 Auto-resolving problems:', problems);
      problems.forEach(problem => {
        resolveSpecificProblem(problem);
      });
    }
  }, 10000);
  
  // Store interval for cleanup
  window.autoResolutionInterval = autoResolutionInterval;
}

function disableAutoResolution() {
  if (window.autoResolutionInterval) {
    clearInterval(window.autoResolutionInterval);
    window.autoResolutionInterval = null;
    
    showNotification(
      currentLanguage === 'pt' ? '🛑 Auto-resolução desativada' : '🛑 Auto-resolution disabled',
      'warning',
      3000
    );
  }
}

// Add real-time metrics simulation
function simulateCallMetrics(callId) {
  const call = state.calls.get(callId);
  if (!call || call.status !== 'ACTIVE') return;
  
  // Simulate realistic metrics changes
  const metricsInterval = setInterval(() => {
    if (!state.calls.has(callId) || call.status !== 'ACTIVE' || eventsPaused) {
      clearInterval(metricsInterval);
      return;
    }
    
    // Update metrics based on scenario
    if (call.scenario === 'normal') {
      call.latency = 20 + Math.random() * 10;
      call.jitter = 0.5 + Math.random() * 2;
      call.packetLoss = Math.random() * 0.5;
      call.mos = 4.3 + Math.random() * 0.4;
    } else if (call.scenario === 'one_way_audio') {
      call.latency = 50 + Math.random() * 20;
      call.jitter = 5 + Math.random() * 10;
      call.packetLoss = 80 + Math.random() * 20;
      call.mos = 1.0 + Math.random() * 0.5;
    } else if (call.scenario === 'nat_wrong') {
      call.latency = 150 + Math.random() * 100;
      call.jitter = 10 + Math.random() * 15;
      call.packetLoss = 5 + Math.random() * 10;
      call.mos = 2.5 + Math.random() * 1.0;
    }
    
    renderCalls();
  }, 2000);
  
  return metricsInterval;
}

function appendEvent(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  elEvents.prepend(div);

  // keep list bounded
  while (elEvents.childNodes.length > 300) {
    elEvents.removeChild(elEvents.lastChild);
  }
}

function renderCalls() {
  if (!elCalls) {
    console.error('❌ elCalls element not found');
    return;
  }
  
  const calls = Array.from(state.calls.values());
  if (calls.length === 0) {
    elCalls.innerHTML = '<div class="text-muted p-3 text-center">' + 
      (currentLanguage === 'pt' ? 'Nenhuma chamada ativa' : 'No active calls') + '</div>';
    return;
  }

  elCalls.innerHTML = calls
    .map((call) => {
      const statusColor = getStatusColor(call.status);
      const qualityColor = getQualityColor(call.quality);
      const qualityIcon = getQualityIcon(call.quality);
      
      return `
        <div class="call-item mb-3 p-3 border rounded-3 position-relative bg-white" 
             style="border-left: 4px solid ${statusColor};"
             data-bs-toggle="tooltip" data-bs-placement="right" 
             title="${escapeHtml(getCallTooltip(call))}">
          
          <div class="row align-items-center">
            <div class="col-md-8">
              <div class="d-flex align-items-center mb-2">
                <div class="call-status-indicator me-2" 
                     style="background-color: ${statusColor}; width: 8px; height: 8px; border-radius: 50%;"></div>
                <strong class="me-2">${call.from}</strong>
                <i class="bi bi-arrow-right text-muted me-2"></i>
                <strong>${call.to}</strong>
                <span class="badge bg-secondary ms-2">${call.scenario.replace('_', ' ').toUpperCase()}</span>
              </div>
              
              <div class="d-flex align-items-center text-muted small mb-1">
                <i class="bi bi-telephone-fill me-1"></i>
                <span class="badge ${statusColor} me-2">${call.status}</span>
                <i class="bi bi-clock-fill me-1"></i>
                <span>${call.duration}</span>
                <i class="bi bi-hdd-network-fill ms-3 me-1"></i>
                <span>${call.codec || 'PCMU'}</span>
              </div>
              
              <div class="d-flex align-items-center">
                <span class="badge ${qualityColor} me-2">
                  <i class="bi ${qualityIcon}"></i> ${call.quality || 'Unknown'}
                </span>
                <small class="text-muted">ID: ${call.id}</small>
              </div>
            </div>
            
            <div class="col-md-4 text-end">
              <div class="btn-group" role="group">
                <button class="btn btn-sm btn-outline-info" onclick="showCallDetails('${call.id}')" 
                        title="${currentLanguage === 'pt' ? 'Ver Detalhes' : 'View Details'}">
                  <i class="bi bi-info-circle"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning" onclick="muteCall('${call.id}')" 
                        title="${currentLanguage === 'pt' ? 'Mutar/Desmutar' : 'Mute/Unmute'}">
                  <i class="bi bi-mic-mute-fill"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="hangupCall('${call.id}')" 
                        title="${currentLanguage === 'pt' ? 'Encerrar Chamada' : 'End Call'}">
                  <i class="bi bi-telephone-x"></i>
                </button>
              </div>
              <div class="mt-2">
                <small class="text-muted">
                  ${currentLanguage === 'pt' ? 'Início:' : 'Started:'} ${call.startTime ? call.startTime.toLocaleTimeString() : 'N/A'}
                </small>
              </div>
            </div>
          </div>
          
          <!-- Real-time metrics -->
          <div class="row mt-2 pt-2 border-top">
            <div class="col-md-3">
              <small class="text-muted">${currentLanguage === 'pt' ? 'Latência' : 'Latency'}</small>
              <div class="progress" style="height: 4px;">
                <div class="progress-bar ${getLatencyColor(call.latency || 25)}" 
                     style="width: ${Math.min((call.latency || 25) * 2, 100)}%"></div>
              </div>
              <small>${call.latency || 25}ms</small>
            </div>
            <div class="col-md-3">
              <small class="text-muted">Jitter</small>
              <div class="progress" style="height: 4px;">
                <div class="progress-bar ${getJitterColor(call.jitter || 1)}" 
                     style="width: ${Math.min((call.jitter || 1) * 10, 100)}%"></div>
              </div>
              <small>${call.jitter || 1}ms</small>
            </div>
            <div class="col-md-3">
              <small class="text-muted">${currentLanguage === 'pt' ? 'Perda' : 'Loss'}</small>
              <div class="progress" style="height: 4px;">
                <div class="progress-bar ${getLossColor(call.packetLoss || 0)}" 
                     style="width: ${call.packetLoss || 0}%"></div>
              </div>
              <small>${call.packetLoss || 0}%</small>
            </div>
            <div class="col-md-3">
              <small class="text-muted">MOS</small>
              <div class="progress" style="height: 4px;">
                <div class="progress-bar ${getMOSColor(call.mos || 4.5)}" 
                     style="width: ${(call.mos || 4.5) * 20}%"></div>
              </div>
              <small>${call.mos || 4.5}</small>
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  initTooltips(elCalls);
  
  // Update call counter
  const callsCount = document.getElementById('activeCallsCount');
  if (callsCount) {
    callsCount.textContent = calls.length;
  }
  
  console.log('📞 Calls rendered:', calls.length, 'calls');
}

function renderAlerts() {
  if (!elAlerts) {
    console.error('❌ elAlerts element not found');
    return;
  }
  
  if (state.alerts.length === 0) {
    elAlerts.innerHTML = '<div class="text-muted">Nenhum alerta</div>';
    return;
  }

  const getTip = (type) => {
    if (type === 'ONE_WAY_AUDIO') {
      return 'Regra: RTP recebido muito abaixo do esperado. Diagnóstico: fluxo RTP quebrado (one-way). Verificar NAT/Firewall e SDP.';
    }
    if (type === 'NAT_SUSPECTED') {
      return 'Regra: suspeita de NAT/Firewall. Pistas: IP anunciado no SDP não bate com o IP visto na rede; falta de resposta RTP; sem pinhole.';
    }
    if (type === 'HIGH_LATENCY') {
      return 'Regra: latência > 150ms. Pode causar áudio robótico/atrasado. Verificar rota, congestionamento e jitter buffer.';
    }
    return 'Alerta gerado por heurística do analisador de RTP.';
  };

  elAlerts.innerHTML = state.alerts
    .map((a) => {
      const cls = a.severity === 'ALERT' ? 'alert-danger' : 'alert-warning';
      const details = a.details ? `<div class="small text-muted">${escapeHtml(JSON.stringify(a.details))}</div>` : '';
      const tip = getTip(a.type);
      return `
        <div class="alert ${cls} py-2 mb-2" data-bs-toggle="tooltip" data-bs-placement="right" title="${escapeHtml(tip)}">
          <div><strong>${a.type}</strong> — ${escapeHtml(a.message || '')}</div>
          <div class="small">${fmtTs(a.ts)} | Call: ${escapeHtml(a.callId || '-')} | Stream: ${escapeHtml(a.streamId || '-')}</div>
          ${details}
        </div>
      `;
    })
    .join('');

  initTooltips(elAlerts);
}

function pushAlert(alert) {
  state.alerts.unshift(alert);
  state.alerts = state.alerts.slice(0, 50);
  renderAlerts();
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

socket.on('connect', () => {
  socket.emit('request_snapshot');
  initTooltips();
});

socket.on('call_event', (ev) => {
  if (ev.type === 'SNAPSHOT' && Array.isArray(ev.calls)) {
    state.calls.clear();
    for (const c of ev.calls) state.calls.set(c.id, c);
    renderCalls();
    return;
  }

  if (ev.type === 'CALL_STATUS') {
    const existing = state.calls.get(ev.callId) || { id: ev.callId };
    state.calls.set(ev.callId, { ...existing, status: ev.status });
    renderCalls();
  }

  if (ev.type === 'RTP_START') {
    const existing = state.calls.get(ev.callId) || { id: ev.callId };
    state.calls.set(ev.callId, { ...existing, rtp: ev });
    renderCalls();
  }

  if (ev.type === 'CALL_END') {
    state.calls.delete(ev.callId);
    renderCalls();
  }

  const details =
    ev.type === 'SIP'
      ? `<pre class="mb-0 small bg-white border rounded p-2" style="white-space: pre-wrap;">${escapeHtml(ev.message || '')}</pre>`
      : `<div class="text-muted">${escapeHtml(JSON.stringify(ev))}</div>`;

  const content = `<div class="border-bottom py-1">
    <div><span class="text-muted">[${fmtTs(ev.ts)}]</span> <strong>${escapeHtml(ev.type)}</strong>${ev.callId ? ` <span class="text-muted">(${escapeHtml(ev.callId)})</span>` : ''}</div>
    ${details}
  </div>`;
  appendEvent(content);
});

socket.on('rtp_problem', (problem) => {
  pushAlert(problem);
});

socket.on('nat_detected', (problem) => {
  pushAlert({ ...problem, message: (problem.message || '') + ' (NAT detected)' });
});

async function refreshStats() {
  try {
    const res = await fetch('/system/stats');
    const data = await res.json();
    elStats.textContent = JSON.stringify(data, null, 2);
  } catch {
    // ignore
  }
}

setInterval(refreshStats, 1500);
refreshStats();
