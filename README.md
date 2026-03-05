# VoIP Monitoring Platform

Plataforma de monitoramento e análise de tráfego VoIP em tempo real com demonstração de problemas comuns (one-way audio, NAT, latência).

## Deploy no Railway

### Pré-requisitos
- Conta no Railway (https://railway.app)
- Git instalado localmente
- Repositório GitHub (ou Railway Git)

### Passos para Deploy

1. **Fazer upload do projeto para GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/voip-interview-demo.git
   git push -u origin main
   ```

2. **Criar novo projeto no Railway**
   - Acesse https://railway.app
   - Clique em "New Project" → "Deploy from GitHub repo"
   - Selecione seu repositório
   - Railway detectará automaticamente que é um projeto Node.js

3. **Configurações (se necessário)**
   - Railway usará automaticamente a porta definida em `process.env.PORT`
   - O arquivo `railway.json` já está configurado para:
     - Usar Nixpacks para build
     - Health check na raiz ("/")
     - Restart automático em falhas

4. **Variáveis de ambiente (opcional)**
   - Não são necessárias variáveis extras
   - O sistema funciona com configurações padrão

5. **Acessar a aplicação**
   - Após deploy, Railway fornecerá uma URL pública
   - Ex: https://voip-monitoring.up.railway.app

### Funcionalidades

- **Monitoramento em tempo real** de chamadas VoIP
- **Detecção automática** de one-way audio
- **Alertas de NAT/Firewall**
- **Análise de latência**
- **Interface bilíngue** (Português/Inglês)
- **Exemplos práticos** para call center, SAMU DF e controle de frota

### Tecnologias

- Node.js + Express
- Socket.io para comunicação em tempo real
- Bootstrap 5 para interface responsiva
- Simulação de SIP/RTP para demonstração

### Estrutura do Projeto

```
├── server.js              # Servidor principal
├── modules/               # Módulos de simulação
│   ├── sipSimulator.js    # Simulação SIP
│   ├── rtpAnalyzer.js     # Análise RTP
│   ├── pcapParser.js      # Parser de logs
│   └── eventSimulator.js  # Simulador de eventos
├── public/                # Arquivos estáticos
│   ├── index.html         # Dashboard
│   └── dashboard.js       # Lógica do frontend
├── pcap/                  # Logs de exemplo
├── railway.json           # Configuração Railway
└── package.json           # Dependências
```

### Uso

1. Acesse a URL fornecida pelo Railway
2. Use os botões para simular diferentes cenários:
   - **Chamada normal**: fluxo SIP/RTP completo
   - **One-way audio**: problema clássico de NAT
   - **NAT incorreto**: SDP com IP privado
3. Monitore alertas e eventos em tempo real
4. Clique em "Como funciona?" para ver exemplos práticos

### Suporte

O projeto está configurado para funcionar imediatamente após deploy no Railway, sem necessidade de configurações adicionais.
