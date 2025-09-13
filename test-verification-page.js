// Test script to verify the admin verification page loads
const axios = require('axios');

async function testVerificationPage() {
  try {
    console.log('Testing admin verification endpoints...\n');

    // Test 1: Get verification statistics
    console.log('1. Testing GET /api/admin/verifications/stats');
    try {
      const statsResponse = await axios.get('http://localhost:5000/api/v1/admin/verifications/stats', {
        headers: {
          // Add your admin auth token here if needed
          'Content-Type': 'application/json'
        }
      });
      console.log('   ✓ Stats endpoint working');
      console.log('   Response:', statsResponse.data);
    } catch (error) {
      console.log('   ✗ Stats endpoint failed:', error.response?.status || error.message);
    }

    // Test 2: Get verifications list
    console.log('\n2. Testing GET /api/admin/verifications');
    try {
      const listResponse = await axios.get('http://localhost:5000/api/v1/admin/verifications?page=1&limit=10', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('   ✓ List endpoint working');
      console.log('   Response:', listResponse.data);
    } catch (error) {
      console.log('   ✗ List endpoint failed:', error.response?.status || error.message);
    }

    // Test 3: Check if frontend page loads
    console.log('\n3. Testing frontend page load');
    try {
      const pageResponse = await axios.get('http://localhost:5174/app/admin/verifications', {
        maxRedirects: 0,
        validateStatus: (status) => status < 500
      });
      console.log('   ✓ Frontend page accessible (Status:', pageResponse.status + ')');
    } catch (error) {
      console.log('   ✗ Frontend page failed:', error.message);
    }

    console.log('\n✅ Verification page tests complete!');
    console.log('\nTo test in browser:');
    console.log('1. Go to http://localhost:5174');
    console.log('2. Sign in as an admin user');
    console.log('3. Navigate to Admin -> Review Verifications');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testVerificationPage();