import { S3Client, ListObjectsV2Command, HeadObjectCommand } from "@aws-sdk/client-s3";

const R2_ACCOUNT_ID = 'd43ed02fb119f74fecd70843fea72cb5';
const R2_ACCESS_KEY_ID = '33064c9f934ceb8a67a5c93130ac1e70';
const R2_SECRET_ACCESS_KEY = 'e9d7a56942420a8f7a0aebc2ca87b4ab6bea28db460a83f8459acc50af83f27d';
const R2_BUCKET_NAME = 'onestopmarketing';
const R2_ENDPOINT = 'https://d43ed02fb119f74fecd70843fea72cb5.r2.cloudflarestorage.com';
const R2_PUBLIC_URL_BASE = 'https://pub-e417bacc3219477ba0f53509654df970.r2.dev';
const R2_TOKEN_URL = 'qyxrL0R7i2Nf3SqRYt1bgluioqys3oyfzjF-6KoC';
// Initialize R2 client
const r2 = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function testR2Connection() {
  console.log('🔍 Testing R2 Connection...');
  console.log(`Bucket: ${R2_BUCKET_NAME}`);
  console.log(`Public URL Base: ${R2_PUBLIC_URL_BASE}`);
  console.log('');

  try {
    // Test 1: List objects in the bucket
    console.log('📋 Listing objects in bucket...');
    const listCommand = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: 'videos/',
      MaxKeys: 10
    });
    
    const listResult = await r2.send(listCommand);
    
    if (listResult.Contents && listResult.Contents.length > 0) {
      console.log(`✅ Found ${listResult.Contents.length} objects in videos/ folder:`);
      listResult.Contents.forEach(obj => {
        console.log(`   - ${obj.Key} (${obj.Size} bytes)`);
      });
    } else {
      console.log('⚠️  No objects found in videos/ folder');
    }
    console.log('');

    // Test 2: Check specific video file (6.mp4)
    console.log('🎥 Testing specific video file: videos/6.mp4');
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: 'videos/6.mp4'
      });
      
      const headResult = await r2.send(headCommand);
      console.log('✅ Video file exists in R2 bucket');
      console.log(`   Size: ${headResult.ContentLength} bytes`);
      console.log(`   Content-Type: ${headResult.ContentType}`);
      console.log(`   Last Modified: ${headResult.LastModified}`);
    } catch (error) {
      console.log('❌ Video file does not exist in R2 bucket');
      console.log(`   Error: ${error.message}`);
    }
    console.log('');

    // Test 3: Test public URL accessibility
    console.log('🌐 Testing public URL accessibility...');
    const publicUrl = `${R2_PUBLIC_URL_BASE}/videos/6.mp4`;
    console.log(`Testing URL: ${publicUrl}`);
    
    try {
      const response = await fetch(publicUrl, { method: 'HEAD' });
      if (response.ok) {
        console.log('✅ Public URL is accessible');
        console.log(`   Status: ${response.status} ${response.statusText}`);
        console.log(`   Content-Type: ${response.headers.get('content-type')}`);
        console.log(`   Content-Length: ${response.headers.get('content-length')}`);
      } else {
        console.log('❌ Public URL is not accessible');
        console.log(`   Status: ${response.status} ${response.statusText}`);
        console.log('   This might indicate CORS issues or public access not enabled');
      }
    } catch (error) {
      console.log('❌ Failed to access public URL');
      console.log(`   Error: ${error.message}`);
    }

  } catch (error) {
    console.log('❌ R2 Connection failed');
    console.log(`Error: ${error.message}`);
    
    if (error.message.includes('SignatureDoesNotMatch')) {
      console.log('💡 This usually means your access keys are incorrect');
    } else if (error.message.includes('NoSuchBucket')) {
      console.log('💡 This means the bucket name is incorrect or doesn\'t exist');
    }
  }
}

// Run the test
testR2Connection().catch(console.error); 