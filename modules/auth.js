const crypto = require('crypto');

// In production, users should be stored in a database
// For demo purposes, we'll use in-memory storage with hashed passwords
const users = new Map([
  ['admin', {
    username: 'admin',
    passwordHash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', // admin123
    role: 'admin',
    createdAt: new Date().toISOString()
  }],
  ['voip', {
    username: 'voip',
    passwordHash: 'ef92b778ba7a6c8f2150019a31c5e2ebedbfd408113a747858f6a9c29e4e5a5e', // monitor2024
    role: 'operator',
    createdAt: new Date().toISOString()
  }],
  ['demo', {
    username: 'demo',
    passwordHash: 'fe5c295059323edbc29e7386b4754dc01121a4c525b6211c6c5586a4322a1e5e', // demo123
    role: 'viewer',
    createdAt: new Date().toISOString()
  }]
]);

// Hash password using SHA-256 (in production, use bcrypt with salt)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Verify user credentials
function authenticateUser(username, password) {
  const user = users.get(username);
  if (!user) {
    return { success: false, error: 'User not found' };
  }
  
  const passwordHash = hashPassword(password);
  if (user.passwordHash !== passwordHash) {
    return { success: false, error: 'Invalid password' };
  }
  
  // Remove sensitive data before returning
  const { passwordHash, ...userSafe } = user;
  return { success: true, user: userSafe };
}

// Create session token (JWT-like, simplified for demo)
function createSessionToken(user) {
  const payload = {
    username: user.username,
    role: user.role,
    iat: Date.now(),
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  
  // In production, use real JWT with proper secret
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// Verify session token
function verifySessionToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // Check expiration
    if (Date.now() > payload.exp) {
      return { valid: false, error: 'Token expired' };
    }
    
    return { valid: true, user: payload };
  } catch (error) {
    return { valid: false, error: 'Invalid token' };
  }
}

// Add new user (for demo purposes)
function addUser(username, password, role = 'viewer') {
  if (users.has(username)) {
    return { success: false, error: 'User already exists' };
  }
  
  const user = {
    username,
    passwordHash: hashPassword(password),
    role,
    createdAt: new Date().toISOString()
  };
  
  users.set(username, user);
  return { success: true, user: { username, role, createdAt: user.createdAt } };
}

// Get all users (for demo)
function getAllUsers() {
  const userList = [];
  for (const [username, user] of users) {
    const { passwordHash, ...userSafe } = user;
    userList.push(userSafe);
  }
  return userList;
}

module.exports = {
  hashPassword,
  authenticateUser,
  createSessionToken,
  verifySessionToken,
  addUser,
  getAllUsers
};
