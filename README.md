# VoIP Monitoring Platform

Plataforma de monitoramento e análise de tráfego VoIP em tempo real com demonstração de problemas comuns (one-way audio, NAT, latência).

## 🔐 Acesso ao Sistema

O sistema possui uma tela de login simulada para proteção básica:

### Credenciais de Demonstração
- **Principal**: `admin` / `admin123`
- **Alternativas**: 
  - `voip` / `monitor2024`
  - `demo` / `demo123`

### Funcionalidades de Segurança
- Login com validação de credenciais específicas
- Sessão persistente com opção "Lembrar-me"
- Logout com limpeza de sessão
- Interface bilíngue na tela de login (PT/EN)
- Proteção de rotas no servidor

## 🚀 Deploy no Railway

### Pré-requisitos
- Conta no Railway (https://railway.app)
- Git instalado localmente
- Repositório GitHub

### ⚙️ Configurações Automáticas
O projeto já está configurado com:
- **Porta dinâmica**: `process.env.PORT` (Railway define automaticamente)
- **Health check**: `/login.html` (página de login)
- **Variáveis de ambiente**: `NODE_ENV=production`
- **Build**: Nixpacks com `npm install`
- **Restart**: Automático em falhas (até 10 tentativas)

### 📋 Passos para Deploy

1. **Fazer upload do projeto para GitHub**
   ```bash
   git add .
   git commit -m "Ready for Railway deploy"
   git push origin main
   ```

2. **Criar novo projeto no Railway**
   - Acesse https://railway.app
   - Clique em "New Project" → "Deploy from GitHub repo"
   - Selecione o repositório `hugoDEV-full/voip`
   - Railway detectará automaticamente Node.js

3. **Aguardar deploy**
   - O build levará 2-3 minutos
   - Railway instalará dependências automaticamente
   - O servidor iniciará na porta fornecida

4. **Acessar aplicação**
   - Railway fornecerá URL pública
   - Ex: `https://voip-production.up.railway.app`

### 🧪 Teste de Funcionalidades

Após o deploy, teste todas as funcionalidades:

1. **Acesso inicial**
   - Redireciona para `/login.html`
   - Página carrega com design moderno

2. **Autenticação**
   - Login com `admin` / `admin123`
   - Redireciona para dashboard
   - Mostra nome do usuário

3. **Funcionalidades Principais**
   - Botão "Iniciar chamada (normal)"
   - Botão "Iniciar chamada (one-way audio)"
   - Botão "Iniciar chamada (NAT incorreto)"
   - Botão "Analisar tráfego SIP"
   - Alertas em tempo real

4. **Socket.io (WebSocket)**
   - Eventos em tempo real funcionando
   - Chamadas ativas atualizam
   - Sistema stats atualiza

5. **Modal "Como funciona?"**
   - Abas Geral, SAMU DF, Controle de Frota
   - Exemplos práticos traduzidos
   - Alternância PT/EN

6. **Internacionalização**
   - Seletor de idioma PT/EN
   - Todo conteúdo traduzido
   - Persistência de idioma

7. **Logout**
   - Botão de logout funciona
   - Limpa sessão corretamente
   - Redireciona para login

### 🔧 Troubleshooting

Se algo não funcionar no Railway:

1. **Verificar logs** no painel do Railway
2. **Fazer redeploy** com novas alterações
3. **Verificar variáveis de ambiente**
4. **Testar localmente** com `npm start`

### 📊 Monitoramento

- **Health check**: Railway monitora `/login.html`
- **Logs**: Disponíveis no painel do Railway
- **Métricas**: CPU, memória, tráfego

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
