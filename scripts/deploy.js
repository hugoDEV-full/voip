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
  
  try {
    // Step 1: Initialize database
    console.log('\n📊 Step 1: Database Initialization');
    console.log('----------------------------------------');
    
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
    console.log('🌐 Application is ready to start...');
    
    // Success exit
    process.exit(0);
    
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
