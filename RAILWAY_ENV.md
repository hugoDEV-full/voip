# Variáveis de Ambiente para Railway (MySQL)

## 🔧 Configurações do Banco de Dados MySQL

Adicione estas variáveis de ambiente no seu projeto Railway:

### Database Configuration
```
DB_HOST=mysql
DB_PORT=3306
DB_USER=root
DB_PASSWORD=senha_secreta_mysql
DB_NAME=voip_monitoring
```

### Como configurar no Railway:

1. **Acesse seu projeto no Railway**
   - Vá para a aba "Variables"
   - Clique em "New Variable"

2. **Adicione as variáveis**:

   **DB_HOST**
   - Nome: `DB_HOST`
   - Valor: `mysql`
   - Descrição: MySQL hostname

   **DB_PORT**
   - Nome: `DB_PORT`
   - Valor: `3306`
   - Descrição: MySQL port

   **DB_USER**
   - Nome: `DB_USER`
   - Valor: `root`
   - Descrição: MySQL username

   **DB_PASSWORD**
   - Nome: `DB_PASSWORD`
   - Valor: `senha_secreta_mysql`
   - Descrição: MySQL password (use uma senha forte!)

   **DB_NAME**
   - Nome: `DB_NAME`
   - Valor: `voip_monitoring`
   - Descrição: Database name

### Adicionar MySQL Plugin no Railway:

1. **Na aba "New"**
   - Procure por "MySQL"
   - Clique em "Add MySQL"
   - Aguarde a criação do banco

2. **Conectar o MySQL ao seu app**
   - O Railway criará automaticamente as variáveis:
     - `MYSQLUSER`
     - `MYSQLPASSWORD`
     - `MYSQLHOST`
     - `MYSQLDATABASE`
     - `MYSQLPORT`

3. **Mapear variáveis** (adicione estas variáveis extras):
   ```
   DB_HOST=${MYSQLHOST}
   DB_PORT=${MYSQLPORT}
   DB_USER=${MYSQLUSER}
   DB_PASSWORD=${MYSQLPASSWORD}
   DB_NAME=${MYSQLDATABASE}
   ```

### Variável de Ambiente Adicional:

```
NODE_ENV=production
```

## 🚀 Deploy Completo

1. **Configure o MySQL Plugin**
2. **Adicione as variáveis de ambiente**
3. **Faça deploy do projeto**
4. **O sistema criará automaticamente:**
   - Tabelas `users` e `user_sessions`
   - Usuários padrão (admin, voip, demo)
   - Índices para performance

## 📋 Credenciais Padrão

Após o deploy, use:

- **admin** / **admin123** (administrador)
- **voip** / **monitor2024** (operador)
- **demo** / **demo123** (visualizador)

## 🔍 Verificação

Após o deploy, verifique os logs no Railway:

```
✅ MySQL connected successfully
✅ Database tables ready
✅ Default users created
🚀 VoIP Monitoring Platform listening
📊 Database: MySQL
🌍 Environment: production
```

Se aparecer "⚠️ Database not available, using fallback mode", verifique as variáveis de ambiente.
