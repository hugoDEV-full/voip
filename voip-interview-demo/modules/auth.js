const crypto = require('crypto');
const { UserDatabase, SessionDatabase } = require('./database');

// Create session token (JWT-like, simplified for demo)
function createSessionToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
    iat: Date.now(),
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  
  // In production, use real JWT with proper secret
  const token = Buffer.from(JSON.stringify(payload)).toString('base64');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  
  return { token, tokenHash, expiresAt: new Date(payload.exp) };
}

// Verify session token
async function verifySessionToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // Check expiration
    if (Date.now() > payload.exp) {
      return { valid: false, error: 'Token expired' };
    }
    
    // Create token hash for database lookup
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Validate session in database
    const session = await SessionDatabase.validateSession(tokenHash);
    
    if (!session.valid) {
      return { valid: false, error: session.error };
    }
    
    return { valid: true, user: session.user };
  } catch (error) {
    return { valid: false, error: 'Invalid token' };
  }
}

// Authenticate user with database
async function authenticateUser(username, password, ipAddress = null, userAgent = null) {
  try {
    const result = await UserDatabase.authenticateUser(username, password);
    
    if (!result.success) {
      return result;
    }
    
    // Create session token
    const { token, tokenHash, expiresAt } = createSessionToken(result.user);
    
    // Store session in database
    const sessionResult = await SessionDatabase.createSession(
      result.user.id,
      tokenHash,
      expiresAt,
      ipAddress,
      userAgent
    );
    
    if (!sessionResult.success) {
      return { success: false, error: 'Failed to create session' };
    }
    
    return { 
      success: true, 
      user: result.user,
      token,
      expiresAt
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

// Logout user
async function logoutUser(token) {
  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const result = await SessionDatabase.deleteSession(tokenHash);
    return result;
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Logout failed' };
  }
}

// Create new user
async function createUser(userData) {
  return await UserDatabase.createUser(userData);
}

// Get user by ID
async function getUserById(userId) {
  return await UserDatabase.getUserById(userId);
}

// Hash password using SHA-256 (kept for compatibility, but bcrypt is used for storage)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

module.exports = {
  hashPassword,
  authenticateUser,
  createSessionToken,
  verifySessionToken,
  logoutUser,
  createUser,
  getUserById
};
