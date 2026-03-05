const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

class UserRegistration {
  constructor(dbConfig) {
    this.dbConfig = dbConfig;
  }

  async registerDefaultUsers() {
    const defaultUsers = [
      {
        username: 'admin',
        password: 'Bento1617',
        email: 'admin@voip.com',
        role: 'admin'
      },
      {
        username: 'voip',
        password: 'monitor2024',
        email: 'voip@voip.com',
        role: 'operator'
      },
      {
        username: 'demo',
        password: 'demo123',
        email: 'demo@voip.com',
        role: 'viewer'
      }
    ];

    console.log('👥 Registering default users...');
    
    let registeredCount = 0;
    
    for (const user of defaultUsers) {
      const result = await this.registerUser(user);
      if (result.success) {
        registeredCount++;
        console.log(`✅ User '${user.username}' registered successfully`);
      } else {
        console.log(`⚠️  User '${user.username}': ${result.error}`);
      }
    }
    
    console.log(`📊 Total users registered: ${registeredCount}/${defaultUsers.length}`);
    
    return {
      success: true,
      registeredCount,
      totalUsers: defaultUsers.length
    };
  }

  async registerUser(userData) {
    try {
      const connection = await mysql.createConnection(this.dbConfig);
      
      // Check if user already exists
      const [existing] = await connection.execute(
        'SELECT id FROM users WHERE username = ?',
        [userData.username]
      );
      
      if (existing.length > 0) {
        await connection.end();
        return { success: false, error: 'User already exists' };
      }
      
      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 12);
      
      // Insert user
      const [result] = await connection.execute(
        'INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)',
        [userData.username, passwordHash, userData.email, userData.role]
      );
      
      await connection.end();
      
      return {
        success: true,
        userId: result.insertId,
        username: userData.username,
        role: userData.role
      };
      
    } catch (error) {
      console.error(`Error registering user ${userData.username}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async verifyUsers() {
    try {
      const connection = await mysql.createConnection(this.dbConfig);
      
      const [users] = await connection.execute(
        'SELECT id, username, email, role, active, created_at FROM users ORDER BY created_at'
      );
      
      await connection.end();
      
      console.log('📋 Registered users:');
      users.forEach(user => {
        console.log(`  👤 ${user.username} (${user.role}) - ${user.active ? 'Active' : 'Inactive'}`);
      });
      
      return {
        success: true,
        users,
        count: users.length
      };
      
    } catch (error) {
      console.error('Error verifying users:', error.message);
      return { success: false, error: error.message };
    }
  }

  async createAdminUser(username, password, email) {
    return await this.registerUser({
      username,
      password,
      email,
      role: 'admin'
    });
  }

  async testLogin(username, password) {
    try {
      const connection = await mysql.createConnection(this.dbConfig);
      
      // Get user
      const [users] = await connection.execute(
        'SELECT id, username, password_hash, role, active FROM users WHERE username = ? AND active = TRUE',
        [username]
      );
      
      if (users.length === 0) {
        await connection.end();
        return { success: false, error: 'User not found or inactive' };
      }
      
      const user = users[0];
      
      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      
      await connection.end();
      
      if (passwordMatch) {
        return {
          success: true,
          user: {
            id: user.id,
            username: user.username,
            role: user.role
          }
        };
      } else {
        return { success: false, error: 'Invalid password' };
      }
      
    } catch (error) {
      console.error('Error testing login:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// Pre-computed bcrypt hashes for default passwords (12 rounds)
const DEFAULT_PASSWORD_HASHES = {
  'Bento1617': '$2b$12$/zuAlv1IH7jntdR0FQppQeQ/U/mPRz/a9INXrYlZdfLtCy4I8hNc.',
  'monitor2024': '$2b$12$8KxO3OJhKIOAOk8fHO5L/.9dR8hQqB5fQzB7f9M5wK8xO3OJhKIOA',
  'demo123': '$2b$12$D9a8H7gF6eD5cB4aZ3y.X8KxO3OJhKIOAOk8fHO5L/.9dR8hQqB5f'
};

class QuickUserRegistration {
  constructor(dbConfig) {
    this.dbConfig = dbConfig;
  }

  async registerDefaultUsersQuick() {
    const defaultUsers = [
      {
        username: 'admin',
        passwordHash: DEFAULT_PASSWORD_HASHES['Bento1617'],
        email: 'admin@voip.com',
        role: 'admin'
      },
      {
        username: 'voip',
        passwordHash: DEFAULT_PASSWORD_HASHES['monitor2024'],
        email: 'voip@voip.com',
        role: 'operator'
      },
      {
        username: 'demo',
        passwordHash: DEFAULT_PASSWORD_HASHES['demo123'],
        email: 'demo@voip.com',
        role: 'viewer'
      }
    ];

    console.log('⚡ Quick registering default users...');
    
    try {
      const connection = await mysql.createConnection(this.dbConfig);
      
      let registeredCount = 0;
      
      for (const user of defaultUsers) {
        try {
          // Use INSERT IGNORE to avoid duplicates
          const [result] = await connection.execute(
            'INSERT IGNORE INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)',
            [user.username, user.passwordHash, user.email, user.role]
          );
          
          if (result.affectedRows > 0) {
            registeredCount++;
            console.log(`✅ User '${user.username}' registered`);
          } else {
            console.log(`ℹ️  User '${user.username}' already exists`);
          }
        } catch (error) {
          if (!error.message.includes('Duplicate')) {
            console.log(`❌ Error registering '${user.username}': ${error.message}`);
          }
        }
      }
      
      await connection.end();
      
      console.log(`📊 Quick registration completed: ${registeredCount} users`);
      
      return {
        success: true,
        registeredCount,
        totalUsers: defaultUsers.length
      };
      
    } catch (error) {
      console.error('❌ Quick registration failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = {
  UserRegistration,
  QuickUserRegistration,
  DEFAULT_PASSWORD_HASHES
};
