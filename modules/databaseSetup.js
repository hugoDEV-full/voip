const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

class DatabaseSetup {
  constructor(config) {
    this.config = config;
    this.initSqlPath = path.join(__dirname, '../database/init.sql');
  }

  async initializeDatabase() {
    try {
      console.log('🔧 Starting database initialization...');
      
      // Read SQL file
      const sqlContent = fs.readFileSync(this.initSqlPath, 'utf8');
      
      // Connect to MySQL without database specified
      const connectionConfig = { ...this.config };
      delete connectionConfig.database; // Remove database to connect to MySQL server
      
      const connection = await mysql.createConnection(connectionConfig);
      console.log('✅ Connected to MySQL server');
      
      // Execute SQL initialization
      console.log('📝 Creating database and tables...');
      
      // Split SQL by semicolons and execute each statement
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      let usersCreated = 0;
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            const [results] = await connection.execute(statement);
            
            // Check if users were created
            if (statement.includes('INSERT INTO users')) {
              usersCreated++;
            }
            
            // Log important results
            if (statement.includes('SELECT') && results.length > 0) {
              if (results[0].message) {
                console.log(`📊 ${results[0].message}`);
              }
              if (results[0].total_users !== undefined) {
                console.log(`👥 Total users created: ${results[0].total_users}`);
              }
            }
            
          } catch (error) {
            // Ignore "already exists" errors
            if (!error.message.includes('already exists') && 
                !error.message.includes('Duplicate entry')) {
              console.error(`❌ SQL Error: ${error.message}`);
              console.error(`Statement: ${statement.substring(0, 100)}...`);
            }
          }
        }
      }
      
      await connection.end();
      
      console.log('✅ Database initialization completed successfully!');
      console.log(`👥 ${usersCreated} default users created`);
      
      return {
        success: true,
        usersCreated,
        message: 'Database initialized successfully'
      };
      
    } catch (error) {
      console.error('❌ Database initialization failed:', error.message);
      
      // Try to create database without init file
      return await this.fallbackInitialization();
    }
  }

  async fallbackInitialization() {
    try {
      console.log('🔄 Attempting fallback initialization...');
      
      const connection = await mysql.createConnection({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password
      });
      
      // Create database
      await connection.execute(`CREATE DATABASE IF NOT EXISTS ${this.config.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      console.log('✅ Database created');
      
      // Use database
      await connection.execute(`USE ${this.config.database}`);
      
      // Create users table
      const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          email VARCHAR(100),
          role ENUM('admin', 'operator', 'viewer') DEFAULT 'viewer',
          active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          last_login TIMESTAMP NULL,
          INDEX idx_username (username),
          INDEX idx_role (role)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `;
      
      await connection.execute(createUsersTable);
      console.log('✅ Users table created');
      
      // Create sessions table
      const createSessionsTable = `
        CREATE TABLE IF NOT EXISTS user_sessions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          token_hash VARCHAR(255) NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          ip_address VARCHAR(45),
          user_agent TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_id (user_id),
          INDEX idx_token_hash (token_hash),
          INDEX idx_expires_at (expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `;
      
      await connection.execute(createSessionsTable);
      console.log('✅ Sessions table created');
      
      await connection.end();
      
      return {
        success: true,
        message: 'Fallback initialization completed'
      };
      
    } catch (error) {
      console.error('❌ Fallback initialization also failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async checkDatabaseExists() {
    try {
      const connection = await mysql.createConnection({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database
      });
      
      // Check if tables exist
      const [tables] = await connection.execute("SHOW TABLES");
      const tableNames = tables.map(t => Object.values(t)[0]);
      
      await connection.end();
      
      return {
        exists: tableNames.includes('users') && tableNames.includes('user_sessions'),
        tables: tableNames
      };
      
    } catch (error) {
      return { exists: false, error: error.message };
    }
  }
}

module.exports = DatabaseSetup;
