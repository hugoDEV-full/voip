# VoIP Monitoring Platform

Plataforma de monitoramento e análise de tráfego VoIP em tempo real com demonstração de problemas comuns (one-way audio, NAT, latência).

## 🔐 Acesso ao Sistema

O sistema possui uma tela de login simulada para proteção básica:

### Credencial de Acesso
- **Administrador**: `admin` / `Admin@2024!VoIP`

### Funcionalidades de Segurança
- Login com validação de credenciais específicas
- Sessão persistente com opção "Lembrar-me"
- Logout com limpeza de sessão
- Interface bilíngue na tela de login (PT/EN)
- Proteção de rotas no servidor

## 🚀 Deploy no Railway com MySQL

### Pré-requisitos
- Conta no Railway (https://railway.app)
- Git instalado localmente
- Repositório GitHub

### 🗄️ Configuração do MySQL no Railway

1. **Adicionar Plugin MySQL**
   - No seu projeto Railway, clique em "New"
   - Procure por "MySQL" e selecione
   - Clique em "Add MySQL Plugin"
   - Aguarde a criação do banco (2-3 minutos)

2. **Variáveis de Ambiente Automáticas**
   O Railway criará automaticamente:
   - `MYSQLHOST` - Host do banco
   - `MYSQLPORT` - Porta (geralmente 3306)
   - `MYSQLUSER` - Usuário (geralmente root)
   - `MYSQLPASSWORD` - Senha gerada
   - `MYSQLDATABASE` - Nome do banco

3. **Variáveis Adicionais (Opcional)**
   Se preferir nomes diferentes, adicione:
   ```
   DB_HOST=${MYSQLHOST}
   DB_PORT=${MYSQLPORT}
   DB_USER=${MYSQLUSER}
   DB_PASSWORD=${MYSQLPASSWORD}
   DB_NAME=${MYSQLDATABASE}
   NODE_ENV=production
   ```

### ⚙️ Configurações Automáticas
O projeto já está configurado com:
- **Porta dinâmica**: `process.env.PORT` (Railway define automaticamente)
- **Health check**: `/login.html` (página de login)
- **Build**: Nixpacks com `npm install`
- **Restart**: Automático em falhas (até 10 tentativas)
- **Database**: MySQL com pool de conexões

### 📋 Passos para Deploy

1. **Fazer upload do projeto para GitHub**
   ```bash
   git add .
   git commit -m "Ready for Railway MySQL deploy"
   git push origin main
   ```

2. **Criar novo projeto no Railway**
   - Acesse https://railway.app
   - Clique em "New Project" → "Deploy from GitHub repo"
   - Selecione o repositório `hugoDEV-full/voip`
   - Railway detectará automaticamente Node.js

3. **Adicionar MySQL Plugin**
   - No projeto, clique em "New"
   - Selecione "MySQL" → "Add Plugin"
   - Aguarde provisionamento

4. **Aguardar deploy**
   - O build levará 3-5 minutos
   - Railway instalará dependências e conectará ao MySQL
   - As tabelas serão criadas automaticamente

5. **Acessar aplicação**
   - Railway fornecerá URL pública
   - Ex: `https://voip-production.up.railway.app`

### 🔐 Credenciais Padrão

O sistema criará automaticamente:

| Usuário | Senha | Role | Descrição |
|---------|-------|------|-----------|
| admin | Admin@2024!VoIP | admin | Acesso total |

### 📊 Estrutura do Banco de Dados

```sql
users
├── id (PK)
├── username (UNIQUE)
├── password_hash (bcrypt)
├── email
├── role (admin/operator/viewer)
├── active
├── created_at
├── last_login

user_sessions
├── id (PK)
├── user_id (FK)
├── token_hash
├── expires_at
├── ip_address
├── user_agent
```

### 🧪 Teste de Funcionalidades

Após o deploy, teste todas as funcionalidades:

1. **Acesso inicial**
   - ✅ Redireciona para `/login.html`
   - ✅ Página carrega com design moderno

2. **Autenticação com MySQL**
   - ✅ Login validado no banco de dados
   - ✅ Senhas hasheadas com bcrypt
   - ✅ Sessões armazenadas no MySQL
   - ✅ Redireciona para dashboard

3. **Funcionalidades Principais**
   - ✅ "Iniciar chamada (normal)"
   - ✅ "Iniciar chamada (one-way audio)"
   - ✅ "Iniciar chamada (NAT incorreto)"
   - ✅ "Analisar tráfego SIP"
   - ✅ Alertas em tempo real

4. **Socket.io (WebSocket)**
   - ✅ Eventos em tempo real funcionando
   - ✅ Chamadas ativas atualizam
   - ✅ Sistema stats atualiza

5. **Modal "Como funciona?"**
   - ✅ Abas Geral, SAMU DF, Controle de Frota
   - ✅ Exemplos práticos traduzidos
   - ✅ Alternância PT/EN

6. **Internacionalização**
   - ✅ Seletor de idioma PT/EN
   - ✅ Todo conteúdo traduzido
   - ✅ Persistência de idioma

7. **Logout**
   - ✅ Remove sessão do MySQL
   - ✅ Limpa cookie corretamente
   - ✅ Redireciona para login

### 🔧 Troubleshooting

Se algo não funcionar no Railway:

1. **Verificar logs** no painel do Railway
   - Procure por: `✅ MySQL connected successfully`
   - Se aparecer fallback, verifique variáveis de ambiente

2. **Variáveis de ambiente**
   - Confirme que `MYSQLHOST`, `MYSQLPORT`, etc. existem
   - Verifique se o MySQL Plugin está ativo

3. **Conexão com banco**
   - Aguarde 2-3 minutos após o deploy
   - O MySQL pode levar tempo para inicializar

4. **Fazer redeploy**
   - Commit de novas alterações
   - Railway fará deploy automático

### 📊 Monitoramento

- **Health check**: Railway monitora `/login.html`
- **Logs**: Disponíveis no painel do Railway
- **Métricas**: CPU, memória, tráfego
- **Database**: Status do MySQL no Railway

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
