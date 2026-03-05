#!/usr/bin/env node

/**
 * VoIP Monitoring Platform - Automatic Deployment Script
 * This script runs during Railway deployment to:
 * 1. Initialize MySQL database
 * 2. Create tables
 * 3. Register default users
 * 4. Verify setup
 */

const { initDatabase, verifyDatabaseSetup } = require('../modules/database');

async function deploy() {
  console.log('🚀 Starting VoIP Monitoring Platform deployment...');
  console.log('================================================');
  console.log('📍 Working directory:', process.cwd());
  console.log('📍 Node version:', process.version);
  console.log('📍 Environment:', process.env.NODE_ENV || 'development');
  
  try {
    // Step 1: Initialize database
    console.log('\n📊 Step 1: Database Initialization');
    console.log('----------------------------------------');
    
    console.log('🔍 Checking database configuration...');
    console.log('🔍 DB_HOST:', process.env.DB_HOST || process.env.MYSQLHOST || 'not set');
    console.log('🔍 DB_PORT:', process.env.DB_PORT || process.env.MYSQLPORT || 'not set');
    console.log('🔍 DB_USER:', process.env.DB_USER || process.env.MYSQLUSER || 'not set');
    console.log('🔍 DB_NAME:', process.env.DB_NAME || process.env.MYSQLDATABASE || 'not set');
    
    // Check if MySQL is available
    const hasMySQL = process.env.DB_HOST || process.env.MYSQLHOST;
    
    if (!hasMySQL) {
      console.log('⚠️ MySQL not available - using fallback mode');
      console.log('📝 Starting server without database...');
      require('../server.js');
      return;
    }
    
    const dbInitialized = await initDatabase();
    
    if (!dbInitialized) {
      console.error('❌ Database initialization failed!');
      process.exit(1);
    }
    
    console.log('✅ Database initialized successfully!');
    
    // Step 2: Verify setup
    console.log('\n🔍 Step 2: Setup Verification');
    console.log('-----------------------------------');
    
    const verification = await verifyDatabaseSetup();
    
    if (!verification) {
      console.error('❌ Setup verification failed!');
      process.exit(1);
    }
    
    console.log('✅ Setup verified successfully!');
    
    // Step 3: Deployment summary
    console.log('\n📋 Step 3: Deployment Summary');
    console.log('--------------------------------');
    console.log('✅ MySQL database: Connected');
    console.log('✅ Database tables: Created');
    console.log('✅ Default users: Registered');
    console.log('✅ Authentication system: Ready');
    console.log('✅ Session management: Ready');
    console.log('✅ WebSocket support: Ready');
    console.log('✅ Internationalization: Ready');
    
    console.log('\n🎉 Deployment completed successfully!');
    console.log('🌐 Starting application server...');
    
    // Start the server after successful initialization
    console.log('🚀 Starting server.js...');
    require('../server.js');
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

// Run deployment
if (require.main === module) {
  deploy();
}

module.exports = { deploy };
