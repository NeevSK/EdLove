#!/usr/bin/env node
/**
 * Load Doppler secrets for Expo/Gurudevi Mobile
 * This script attempts to load secrets from Doppler and falls back to .env file
 * Usage: node scripts/load-doppler-env.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');

try {
  // Attempt to download secrets from Doppler CLI
  console.log('🔍 Attempting to load secrets from Doppler...');
  
  const envOutput = execSync('doppler secrets download --format env --no-file', {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'ignore']
  });
  
  if (envOutput && !envOutput.includes('Downloaded secrets to')) {
    // Write Doppler secrets to .env file for Expo to use
    fs.writeFileSync(envPath, envOutput);
    console.log('✅ Loaded secrets from Doppler to .env');
    console.log('⚠️  Remember: .env file is gitignored and contains live secrets');
  } else {
    console.log('⚠️ Doppler CLI output unexpected, falling back to .env file');
    if (fs.existsSync(envPath)) {
      console.log('✅ Using existing .env file');
    } else {
      console.log('❌ No .env file found');
      process.exit(1);
    }
  }
} catch (error) {
  // Check if .env file exists as fallback
  if (fs.existsSync(envPath)) {
    console.log('⚠️ Doppler not available, using existing .env file');
  } else {
    console.log('❌ Doppler not available and no .env file found');
    console.log('💡 Run: doppler secrets download --format env > .env');
    process.exit(1);
  }
}
