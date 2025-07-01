import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = 'http://localhost:3000'; // Adjust if your app runs on different port
const TEST_IMAGE_PATH = path.join(__dirname, 'test-image.png');

// Create a simple test image (1x1 pixel PNG)
function createTestImage() {
  // Simple 1x1 pixel PNG file in base64
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA60e6kgAAAABJRU5ErkJggg==';
  const buffer = Buffer.from(pngBase64, 'base64');
  fs.writeFileSync(TEST_IMAGE_PATH, buffer);
  console.log('✅ Test image created');
}

// Clean up test image
function cleanupTestImage() {
  if (fs.existsSync(TEST_IMAGE_PATH)) {
    fs.unlinkSync(TEST_IMAGE_PATH);
    console.log('✅ Test image cleaned up');
  }
}

async function testUploadImage() {
  console.log('🧪 Testing Upload Image Endpoint\n');
  
  try {
    // Step 1: Create a test image
    createTestImage();
    
    // Step 2: First, we need to authenticate and get a session
    // You'll need to replace this with your actual authentication method
    console.log('⚠️  NOTE: This test requires manual authentication setup');
    console.log('   You need to:');
    console.log('   1. Sign in to your app in a browser');
    console.log('   2. Copy the session cookie or token');
    console.log('   3. Add it to the headers below\n');
    
    // Step 3: Create a collection first (required for upload)
    console.log('📁 Creating test collection...');
    const createCollectionResponse = await fetch(`${BASE_URL}/api/slideshow/collections`, {
      method: 'POST',
              headers: {
          'Content-Type': 'application/json',
          'Cookie': 'better-auth.session_token=Nq45ThwO15ueFO0zQtLWs9G9OM2sV5gy.m5bfJiQDF3Ocdwp6Gx5ieR6dUJq2jJX70BD4GdVCb8w%3D'
        },
      body: JSON.stringify({
        name: 'Test Collection for Upload'
      })
    });
    
    if (!createCollectionResponse.ok) {
      const errorText = await createCollectionResponse.text();
      throw new Error(`Failed to create collection: ${createCollectionResponse.status} - ${errorText}`);
    }
    
    const collectionData = await createCollectionResponse.json();
    console.log('✅ Collection created:', collectionData);
    
    const collectionId = collectionData.collection.id;
    
    // Step 4: Test the upload-image endpoint
    console.log('\n📤 Testing image upload...');
    
    // Create FormData with the test image
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(TEST_IMAGE_PATH);
    const blob = new Blob([fileBuffer], { type: 'image/png' });
    formData.append('file', blob, 'test-image.png');
    formData.append('collectionId', collectionId);
    
    const uploadResponse = await fetch(`${BASE_URL}/api/slideshow/upload-image`, {
      method: 'POST',
              headers: {
          'Cookie': 'better-auth.session_token=Nq45ThwO15ueFO0zQtLWs9G9OM2sV5gy.m5bfJiQDF3Ocdwp6Gx5ieR6dUJq2jJX70BD4GdVCb8w%3D'
        },
      body: formData
    });
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
    }
    
    const uploadData = await uploadResponse.json();
    console.log('✅ Image uploaded successfully:', uploadData);
    
    // Step 5: Verify the image was saved correctly
    console.log('\n🔍 Verifying uploaded image...');
    if (uploadData.success && uploadData.image) {
      console.log('✅ Image URL:', uploadData.image.url);
      console.log('✅ Image ID:', uploadData.image.id);
      console.log('✅ Collection ID:', uploadData.image.collectionId);
      console.log('✅ User ID:', uploadData.image.userId);
      
      // Test if the image URL is accessible
      try {
        const imageResponse = await fetch(uploadData.image.url);
        if (imageResponse.ok) {
          console.log('✅ Image is accessible at the provided URL');
        } else {
          console.log('⚠️  Image URL returned status:', imageResponse.status);
        }
      } catch (error) {
        console.log('⚠️  Could not verify image accessibility:', error.message);
      }
    }
    
    // Step 6: Clean up - delete the test collection
    console.log('\n🧹 Cleaning up test collection...');
    const deleteResponse = await fetch(`${BASE_URL}/api/slideshow/collections/${collectionId}`, {
      method: 'DELETE',
      headers: {
        'Cookie': 'better-auth.session_token=Nq45ThwO15ueFO0zQtLWs9G9OM2sV5gy.m5bfJiQDF3Ocdwp6Gx5ieR6dUJq2jJX70BD4GdVCb8w%3D'
      }
    });
    
    if (deleteResponse.ok) {
      console.log('✅ Test collection cleaned up');
    } else {
      console.log('⚠️  Could not clean up test collection');
    }
    
    console.log('\n🎉 Upload image test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.log('\n💡 Authentication Help:');
      console.log('   1. Open your browser and sign in to the app');
      console.log('   2. Open Developer Tools (F12)');
      console.log('   3. Go to Application/Storage > Cookies');
      console.log('   4. Copy the session cookie value');
      console.log('   5. Add it to the headers in this test script');
    }
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Connection Help:');
      console.log('   1. Make sure your Next.js app is running (npm run dev)');
      console.log('   2. Check if the BASE_URL is correct');
    }
  } finally {
    cleanupTestImage();
  }
}

// Manual test function that shows you exactly what to do
async function manualTestInstructions() {
  console.log('🔧 MANUAL TEST INSTRUCTIONS\n');
  console.log('Since this endpoint requires authentication, here\'s how to test it manually:\n');
  
  console.log('1. Start your Next.js app:');
  console.log('   npm run dev\n');
  
  console.log('2. Sign in to your app in a browser\n');
  
  console.log('3. Open Developer Tools (F12) and get your session cookie\n');
  
  console.log('4. Use this curl command to test:');
  console.log(`curl -X POST ${BASE_URL}/api/slideshow/collections \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -H "Cookie: your-session-cookie-here" \\`);
  console.log(`  -d '{"name": "Test Collection"}'`);
  console.log('\n5. Get the collection ID from the response\n');
  
  console.log('6. Test image upload:');
  console.log(`curl -X POST ${BASE_URL}/api/slideshow/upload-image \\`);
  console.log(`  -H "Cookie: your-session-cookie-here" \\`);
  console.log(`  -F "file=@path/to/your/image.png" \\`);
  console.log(`  -F "collectionId=COLLECTION_ID_FROM_STEP_4"`);
  
  console.log('\n7. Check the response for success and image URL\n');
}

// Run the test
if (process.argv.includes('--manual')) {
  manualTestInstructions();
} else {
  testUploadImage();
} 