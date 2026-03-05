const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const DatabaseSetup = require('./databaseSetup');
const { QuickUserRegistration } = require('./userRegistration');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
  port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
  user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
  database: process.env.DB_NAME || process.env.MYSQLDATABASE || 'voip_monitoring',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionLimit: 10
};

let pool;
let isInitialized = false;

// Initialize database connection and setup
async function initDatabase() {
  if (isInitialized) {
    return true;
  }

  try {
    console.log('🔧 Initializing database with automatic setup...');
    
    // First, run the automatic setup
    const dbSetup = new DatabaseSetup(dbConfig);
    const setupResult = await dbSetup.initializeDatabase();
    
    if (!setupResult.success) {
      console.error('❌ Database setup failed:', setupResult.error);
      return false;
    }
    
    // Create connection pool
    pool = mysql.createPool(dbConfig);
    
    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ MySQL connection pool created successfully');
    connection.release();
    
    // Quick register default users (in case setup missed them)
    const userReg = new QuickUserRegistration(dbConfig);
    await userReg.registerDefaultUsersQuick();
    
    // Verify setup
    await verifyDatabaseSetup();
    
    isInitialized = true;
    return true;
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    
    // Fallback to in-memory storage for demo
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️  Using fallback in-memory storage');
      return false;
    }
    throw error;
  }
}

// Verify database setup
async function verifyDatabaseSetup() {
  try {
    const connection = await pool.getConnection();
    
    // Check tables
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    console.log('📋 Database tables:', tableNames.join(', '));
    
    // Check users
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`👥 Users in database: ${users[0].count}`);
    
    // Show users
    const [userList] = await connection.execute(
      'SELECT username, role, created_at FROM users ORDER BY created_at'
    );
    
    if (userList.length > 0) {
      console.log('📋 Registered users:');
      userList.forEach(user => {
        console.log(`  👤 ${user.username} (${user.role})`);
      });
    }
    
    connection.release();
    
    return true;
  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
    return false;
  }
}

// Create database tables (fallback method)
async function createTables() {
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
      INDEX idx_role (role),
      INDEX idx_active (active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  
  try {
    if (!pool) {
      throw new Error('Database pool not initialized');
    }
    
    await pool.execute(createUsersTable);
    await pool.execute(createSessionsTable);
    console.log('✅ Database tables ready');
    
    // Register default users
    const userReg = new QuickUserRegistration(dbConfig);
    await userReg.registerDefaultUsersQuick();
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    throw error;
  }
}

// User management functions
class UserDatabase {
  static async authenticateUser(username, password) {
    try {
      if (!pool) {
        throw new Error('Database not initialized');
      }
      
      const [rows] = await pool.execute(
        'SELECT id, username, password_hash, email, role, active FROM users WHERE username = ? AND active = TRUE',
        [username]
      );
      
      if (rows.length === 0) {
        return { success: false, error: 'User not found' };
      }
      
      const user = rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      
      if (!passwordMatch) {
        return { success: false, error: 'Invalid password' };
      }
      
      // Update last login
      await pool.execute(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [user.id]
      );
      
      // Remove sensitive data
      const { password_hash, ...userSafe } = user;
      return { success: true, user: userSafe };
      
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }
  
  static async createUser(userData) {
    try {
      if (!pool) {
        throw new Error('Database not initialized');
      }
      
      const { username, password, email, role = 'viewer' } = userData;
      
      // Check if user already exists
      const [existing] = await pool.execute(
        'SELECT id FROM users WHERE username = ?',
        [username]
      );
      
      if (existing.length > 0) {
        return { success: false, error: 'Username already exists' };
      }
      
      const passwordHash = await bcrypt.hash(password, 12);
      
      const [result] = await pool.execute(
        'INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)',
        [username, passwordHash, email, role]
      );
      
      return { 
        success: true, 
        user: { id: result.insertId, username, email, role }
      };
      
    } catch (error) {
      console.error('Create user error:', error);
      return { success: false, error: 'Failed to create user' };
    }
  }
  
  static async getUserById(userId) {
    try {
      if (!pool) {
        throw new Error('Database not initialized');
      }
      
      const [rows] = await pool.execute(
        'SELECT id, username, email, role, active, created_at, last_login FROM users WHERE id = ? AND active = TRUE',
        [userId]
      );
      
      return rows.length > 0 ? { success: true, user: rows[0] } : { success: false, error: 'User not found' };
    } catch (error) {
      console.error('Get user error:', error);
      return { success: false, error: 'Failed to get user' };
    }
  }
  
  static async updateUserLastLogin(userId) {
    try {
      if (!pool) {
        throw new Error('Database not initialized');
      }
      
      await pool.execute(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [userId]
      );
      return { success: true };
    } catch (error) {
      console.error('Update last login error:', error);
      return { success: false, error: 'Failed to update last login' };
    }
  }
}

// Session management functions
class SessionDatabase {
  static async createSession(userId, tokenHash, expiresAt, ipAddress = null, userAgent = null) {
    try {
      if (!pool) {
        throw new Error('Database not initialized');
      }
      
      const [result] = await pool.execute(
        'INSERT INTO user_sessions (user_id, token_hash, expires_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
        [userId, tokenHash, expiresAt, ipAddress, userAgent]
      );
      
      return { success: true, sessionId: result.insertId };
    } catch (error) {
      console.error('Create session error:', error);
      return { success: false, error: 'Failed to create session' };
    }
  }
  
  static async validateSession(tokenHash) {
    try {
      if (!pool) {
        throw new Error('Database not initialized');
      }
      
      // Clean expired sessions first
      await pool.execute('DELETE FROM user_sessions WHERE expires_at < NOW()');
      
      const [rows] = await pool.execute(`
        SELECT s.user_id, s.expires_at, u.username, u.email, u.role 
        FROM user_sessions s 
        JOIN users u ON s.user_id = u.id 
        WHERE s.token_hash = ? AND s.expires_at > NOW() AND u.active = TRUE
      `, [tokenHash]);
      
      if (rows.length === 0) {
        return { valid: false, error: 'Invalid or expired session' };
      }
      
      const session = rows[0];
      return { 
        valid: true, 
        user: {
          id: session.user_id,
          username: session.username,
          email: session.email,
          role: session.role
        }
      };
    } catch (error) {
      console.error('Validate session error:', error);
      return { valid: false, error: 'Session validation failed' };
    }
  }
  
  static async deleteSession(tokenHash) {
    try {
      if (!pool) {
        throw new Error('Database not initialized');
      }
      
      const [result] = await pool.execute(
        'DELETE FROM user_sessions WHERE token_hash = ?',
        [tokenHash]
      );
      
      return { success: true, deleted: result.affectedRows > 0 };
    } catch (error) {
      console.error('Delete session error:', error);
      return { success: false, error: 'Failed to delete session' };
    }
  }
  
  static async deleteAllUserSessions(userId) {
    try {
      if (!pool) {
        throw new Error('Database not initialized');
      }
      
      const [result] = await pool.execute(
        'DELETE FROM user_sessions WHERE user_id = ?',
        [userId]
      );
      
      return { success: true, deleted: result.affectedRows };
    } catch (error) {
      console.error('Delete all sessions error:', error);
      return { success: false, error: 'Failed to delete sessions' };
    }
  }
}

// Get database connection pool
function getPool() {
  return pool;
}

// Check if database is initialized
function isDatabaseInitialized() {
  return isInitialized;
}

// Close database connection
async function closeDatabase() {
  if (pool) {
    await pool.end();
    console.log('Database connection closed');
    isInitialized = false;
  }
}

module.exports = {
  initDatabase,
  UserDatabase,
  SessionDatabase,
  getPool,
  closeDatabase,
  isDatabaseInitialized,
  createTables,
  verifyDatabaseSetup
};
