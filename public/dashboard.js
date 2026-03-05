const socket = io();

const elCalls = document.getElementById('calls');
const elEvents = document.getElementById('events');
const elAlerts = document.getElementById('alerts');
const elStats = document.getElementById('stats');

const btnSimNormal = document.getElementById('btnSimNormal');
const btnSimOneWay = document.getElementById('btnSimOneWay');
const btnSimNat = document.getElementById('btnSimNat');
const btnAnalyze = document.getElementById('btnAnalyze');

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

// Initialize user display on page load
displayUserInfo();

// Initial render to show empty states
renderCalls();
renderAlerts();

// Apply saved language on load
applyLanguage(currentLang);

function fmtTs(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString();
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
  const calls = Array.from(state.calls.values());
  if (calls.length === 0) {
    elCalls.innerHTML = '<div class="text-muted">Nenhuma chamada ativa</div>';
    return;
  }

  elCalls.innerHTML = calls
    .map((c) => {
      const badge = c.scenario === 'normal' ? 'bg-success' : (c.scenario === 'one_way_audio' ? 'bg-warning text-dark' : 'bg-danger');

      const scenarioTip =
        c.scenario === 'normal'
          ? 'Fluxo esperado: SIP completa + RTP bidirecional.'
          : (c.scenario === 'one_way_audio'
            ? 'One-way audio: A envia RTP mas B não recebe. Em produção, investigue NAT/Firewall, SDP (c=/m=) e pinholes.'
            : 'NAT incorreto: SDP pode anunciar IP privado (c=10.x.x.x). Sintoma típico: sem áudio e/ou latência alta.');

      return `
        <div class="border rounded p-2 mb-2 bg-white" data-bs-toggle="tooltip" data-bs-placement="right" title="${escapeHtml(scenarioTip)}">
          <div><strong>${c.from}</strong> → <strong>${c.to}</strong> <span class="badge ${badge}">${c.scenario}</span></div>
          <div class="text-muted">Call-ID: ${c.id}</div>
          <div>Status: <strong>${c.status || 'N/A'}</strong></div>
        </div>
      `;
    })
    .join('');

  initTooltips(elCalls);
}

function renderAlerts() {
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

async function placeCall(scenario) {
  await fetch('/call', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: '1000', to: '1001', scenario }),
  });
}

async function analyzePcap() {
  await fetch('/pcap/analyze');
}

btnSimNormal.addEventListener('click', () => placeCall('normal'));
btnSimOneWay.addEventListener('click', () => placeCall('one_way_audio'));
btnSimNat.addEventListener('click', () => placeCall('nat_wrong'));
btnAnalyze.addEventListener('click', () => analyzePcap());

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
