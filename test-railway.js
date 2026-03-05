// Test script to verify all functionality works on Railway
const http = require('http');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function testEndpoint(path, description) {
  console.log(`\n🧪 Testing: ${description}`);
  console.log(`   URL: ${BASE_URL}${path}`);
  
  try {
    const response = await fetch(`${BASE_URL}${path}`);
    console.log(`   ✅ Status: ${response.status}`);
    
    if (path.includes('login.html')) {
      const text = await response.text();
      if (text.includes('VoIP Monitoring Platform')) {
        console.log(`   ✅ Login page loaded correctly`);
      } else {
        console.log(`   ❌ Login page content missing`);
      }
    }
    
    return true;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function testAuthFlow() {
  console.log(`\n🔐 Testing Authentication Flow`);
  
  try {
    // Test login
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    if (loginResponse.ok) {
      console.log(`   ✅ Login successful`);
      
      // Get cookies from response
      const cookies = loginResponse.headers.get('set-cookie');
      if (cookies) {
        console.log(`   ✅ Session cookie set`);
      }
      
      // Test protected route
      const protectedResponse = await fetch(`${BASE_URL}/`, {
        headers: { 'Cookie': cookies }
      });
      
      if (protectedResponse.ok) {
        console.log(`   ✅ Protected route accessible`);
      } else {
        console.log(`   ❌ Protected route blocked`);
      }
      
      // Test logout
      const logoutResponse = await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Cookie': cookies }
      });
      
      if (logoutResponse.ok) {
        console.log(`   ✅ Logout successful`);
      }
    } else {
      console.log(`   ❌ Login failed`);
    }
  } catch (error) {
    console.log(`   ❌ Auth error: ${error.message}`);
  }
}

async function runTests() {
  console.log(`🚀 Testing VoIP Monitoring Platform for Railway Deployment`);
  console.log(`============================================================`);
  console.log(`Base URL: ${BASE_URL}`);
  
  // Test static files
  await testEndpoint('/login.html', 'Login page');
  await testEndpoint('/login.js', 'Login JavaScript');
  await testEndpoint('/dashboard.js', 'Dashboard JavaScript');
  
  // Test API endpoints
  await testEndpoint('/auth/verify', 'Auth verification (should fail without session)');
  
  // Test authentication flow
  await testAuthFlow();
  
  // Test main dashboard (should redirect to login)
  console.log(`\n🏠 Testing Dashboard Redirect`);
  try {
    const response = await fetch(`${BASE_URL}/`, { redirect: 'manual' });
    if (response.status === 302) {
      console.log(`   ✅ Dashboard redirects to login when not authenticated`);
    } else {
      console.log(`   ❌ Dashboard should redirect to login (got ${response.status})`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  console.log(`\n✅ Railway deployment test complete!`);
  console.log(`\n📋 Manual Testing Checklist:`);
  console.log(`   1. Visit the Railway URL`);
  console.log(`   2. Should redirect to login page`);
  console.log(`   3. Login with admin/admin123`);
  console.log(`   4. Should see the dashboard`);
  console.log(`   5. Try all buttons: Normal, One-way, NAT, Analyze`);
  console.log(`   6. Check "Como funciona?" modal`);
  console.log(`   7. Test language switch PT/EN`);
  console.log(`   8. Test logout functionality`);
  console.log(`   9. Verify Socket.io events are working`);
  console.log(`   10. Check all alerts and real-time updates`);
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ fetch() not available. Please use Node.js 18+ or install node-fetch.');
  process.exit(1);
}

runTests().catch(console.error);
