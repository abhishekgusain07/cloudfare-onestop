#!/usr/bin/env node

/**
 * Simple Upload Image Test
 * 
 * This script helps you test the /api/slideshow/upload-image endpoint
 * by providing step-by-step instructions and validation.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// ANSI color codes for prettier console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function createTestImage() {
  const testImagePath = path.join(__dirname, 'test-upload.png');
  
  // Create a simple 1x1 pixel PNG (red pixel)
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, // 8-bit RGB
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 
    0x03, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82 // IEND
  ]);
  
  fs.writeFileSync(testImagePath, pngData);
  return testImagePath;
}

async function checkServerStatus() {
  try {
    const response = await fetch(`${BASE_URL}/api/test`);
    return response.status !== 404; // If it's not 404, server is probably running
  } catch (error) {
    return false;
  }
}

async function validateEndpoint(path, method = 'GET') {
  try {
    const response = await fetch(`${BASE_URL}${path}`, { method });
    return {
      exists: response.status !== 404,
      status: response.status,
      needsAuth: response.status === 401
    };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

async function runPreFlightChecks() {
  log('\n🔍 Running Pre-flight Checks...', 'cyan');
  
  // Check if server is running
  log('\n1. Checking if server is running...', 'blue');
  const serverRunning = await checkServerStatus();
  if (serverRunning) {
    log('   ✅ Server is running', 'green');
  } else {
    log('   ❌ Server is not running or not accessible', 'red');
    log('   💡 Run: npm run dev', 'yellow');
    return false;
  }
  
  // Check if endpoints exist
  log('\n2. Checking if slideshow endpoints exist...', 'blue');
  const endpoints = [
    '/api/slideshow/collections',
    '/api/slideshow/upload-image'
  ];
  
  for (const endpoint of endpoints) {
    const result = await validateEndpoint(endpoint, 'POST');
    if (result.exists) {
      if (result.needsAuth) {
        log(`   ✅ ${endpoint} exists (requires auth)`, 'green');
      } else {
        log(`   ⚠️  ${endpoint} exists but may have issues`, 'yellow');
      }
    } else {
      log(`   ❌ ${endpoint} not found`, 'red');
      return false;
    }
  }
  
  return true;
}

function showTestInstructions() {
  log('\n📋 MANUAL TEST INSTRUCTIONS', 'bright');
  log('=' * 50, 'cyan');
  
  log('\nStep 1: Get Authentication Cookie', 'yellow');
  log('   1. Open your browser and navigate to: ' + BASE_URL);
  log('   2. Sign in to your account');
  log('   3. Open Developer Tools (F12)');
  log('   4. Go to Application → Cookies');
  log('   5. Find and copy the session cookie value');
  
  log('\nStep 2: Create a Collection', 'yellow');
  log('   Run this curl command (replace YOUR_COOKIE):');
  log(`   curl -X POST ${BASE_URL}/api/slideshow/collections \\`, 'cyan');
  log(`     -H "Content-Type: application/json" \\`, 'cyan');
  log(`     -H "Cookie: YOUR_COOKIE_HERE" \\`, 'cyan');
  log(`     -d '{"name": "Test Upload Collection"}'`, 'cyan');
  
  log('\nStep 3: Test Image Upload', 'yellow');
  log('   Get the collection ID from step 2, then run:');
  
  // Create test image for the demo
  const testImagePath = createTestImage();
  log(`   curl -X POST ${BASE_URL}/api/slideshow/upload-image \\`, 'cyan');
  log(`     -H "Cookie: YOUR_COOKIE_HERE" \\`, 'cyan');
  log(`     -F "file=@${testImagePath}" \\`, 'cyan');
  log(`     -F "collectionId=COLLECTION_ID_FROM_STEP_2"`, 'cyan');
  
  log('\nStep 4: Verify Response', 'yellow');
  log('   Expected successful response:');
  log('   {', 'green');
  log('     "success": true,', 'green');
  log('     "image": {', 'green');
  log('       "id": "...",', 'green');
  log('       "url": "https://cloudinary.../image.png",', 'green');
  log('       "collectionId": "...",', 'green');
  log('       "userId": "..."', 'green');
  log('     }', 'green');
  log('   }', 'green');
  
  log(`\n📁 Test image created at: ${testImagePath}`, 'blue');
  log('   You can use this image for testing or create your own.', 'blue');
}

async function quickAPITest() {
  log('\n🚀 Quick API Test (without authentication)', 'cyan');
  
  try {
    // Test collections endpoint without auth - should return 401
    log('\nTesting collections endpoint...', 'blue');
    const collectionsResponse = await fetch(`${BASE_URL}/api/slideshow/collections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test' })
    });
    
    if (collectionsResponse.status === 401) {
      log('   ✅ Collections endpoint properly requires authentication', 'green');
    } else {
      log(`   ⚠️  Collections endpoint returned unexpected status: ${collectionsResponse.status}`, 'yellow');
    }
    
    // Test upload endpoint without auth - should return 401
    log('\nTesting upload-image endpoint...', 'blue');
    const uploadResponse = await fetch(`${BASE_URL}/api/slideshow/upload-image`, {
      method: 'POST'
    });
    
    if (uploadResponse.status === 401) {
      log('   ✅ Upload-image endpoint properly requires authentication', 'green');
    } else {
      log(`   ⚠️  Upload-image endpoint returned unexpected status: ${uploadResponse.status}`, 'yellow');
    }
    
  } catch (error) {
    log(`   ❌ API test failed: ${error.message}`, 'red');
  }
}

async function main() {
  log('🧪 Upload Image Endpoint Test Suite', 'bright');
  log('=====================================', 'cyan');
  
  const preFlightPassed = await runPreFlightChecks();
  
  if (!preFlightPassed) {
    log('\n❌ Pre-flight checks failed. Please fix the issues above.', 'red');
    return;
  }
  
  await quickAPITest();
  
  showTestInstructions();
  
  log('\n✨ Test suite completed!', 'green');
  log('   Follow the manual instructions above to test with authentication.', 'blue');
}

// Run the test
main().catch(error => {
  log(`\n💥 Test suite failed: ${error.message}`, 'red');
  process.exit(1);
}); 