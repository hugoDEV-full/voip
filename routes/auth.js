const express = require('express');
const router = express.Router();
const { authenticateUser, createSessionToken, verifySessionToken } = require('../modules/auth');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username and password are required' 
      });
    }
    
    // Authenticate user
    const authResult = authenticateUser(username, password);
    
    if (!authResult.success) {
      return res.status(401).json({ 
        success: false, 
        error: authResult.error 
      });
    }
    
    // Create session token
    const token = createSessionToken(authResult.user);
    
    // Set HTTP-only cookie
    res.cookie('voipSession', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    res.json({ 
      success: true, 
      user: authResult.user,
      message: 'Login successful'
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  res.clearCookie('voipSession');
  res.json({ 
    success: true, 
    message: 'Logout successful' 
  });
});

// Verify session route
router.get('/verify', (req, res) => {
  const token = req.cookies.voipSession;
  
  if (!token) {
    return res.status(401).json({ 
      valid: false, 
      error: 'No session token' 
    });
  }
  
  const verification = verifySessionToken(token);
  
  if (verification.valid) {
    res.json({ 
      valid: true, 
      user: verification.user 
    });
  } else {
    res.clearCookie('voipSession');
    res.status(401).json({ 
      valid: false, 
      error: verification.error 
    });
  }
});

// Get current user info
router.get('/me', (req, res) => {
  const token = req.cookies.voipSession;
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Not authenticated' 
    });
  }
  
  const verification = verifySessionToken(token);
  
  if (verification.valid) {
    res.json({ 
      success: true, 
      user: verification.user 
    });
  } else {
    res.clearCookie('voipSession');
    res.status(401).json({ 
      success: false, 
      error: verification.error 
    });
  }
});

module.exports = router;
