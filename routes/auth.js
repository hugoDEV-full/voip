const express = require('express');
const router = express.Router();
const { authenticateUser, verifySessionToken, logoutUser } = require('../modules/auth');

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
    
    // Get client info
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    // Authenticate user with database
    const authResult = await authenticateUser(username, password, ipAddress, userAgent);
    
    if (!authResult.success) {
      return res.status(401).json({ 
        success: false, 
        error: authResult.error 
      });
    }
    
    // Set HTTP-only cookie with the token
    res.cookie('voipSession', authResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    res.json({ 
      success: true, 
      user: authResult.user,
      expiresAt: authResult.expiresAt,
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
router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies.voipSession;
    
    if (token) {
      // Remove session from database
      await logoutUser(token);
    }
    
    // Clear cookie
    res.clearCookie('voipSession');
    
    res.json({ 
      success: true, 
      message: 'Logout successful' 
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear cookie even if database fails
    res.clearCookie('voipSession');
    res.json({ 
      success: true, 
      message: 'Logout successful' 
    });
  }
});

// Verify session route
router.get('/verify', async (req, res) => {
  try {
    const token = req.cookies.voipSession;
    
    if (!token) {
      return res.status(401).json({ 
        valid: false, 
        error: 'No session token' 
      });
    }
    
    const verification = await verifySessionToken(token);
    
    if (verification.valid) {
      res.json({ 
        valid: true, 
        user: verification.user 
      });
    } else {
      // Clear invalid token
      res.clearCookie('voipSession');
      res.status(401).json({ 
        valid: false, 
        error: verification.error 
      });
    }
  } catch (error) {
    console.error('Verify session error:', error);
    res.clearCookie('voipSession');
    res.status(401).json({ 
      valid: false, 
      error: 'Session validation failed' 
    });
  }
});

// Get current user info
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies.voipSession;
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authenticated' 
      });
    }
    
    const verification = await verifySessionToken(token);
    
    if (verification.valid) {
      res.json({ 
        success: true, 
        user: verification.user 
      });
    } else {
      // Clear invalid token
      res.clearCookie('voipSession');
      res.status(401).json({ 
        success: false, 
        error: verification.error 
      });
    }
  } catch (error) {
    console.error('Get user info error:', error);
    res.clearCookie('voipSession');
    res.status(401).json({ 
      success: false, 
      error: 'Failed to get user info' 
    });
  }
});

module.exports = router;
