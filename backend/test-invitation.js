#!/usr/bin/env node

/**
 * Test script for Clerk invitation flow
 * Usage: node test-invitation.js <email>
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api/v1';
const TEST_EMAIL = process.argv[2] || 'test@example.com';

async function testInvitationFlow() {
  console.log('🧪 Testing Clerk Invitation Flow');
  console.log('================================\n');

  try {
    // Step 1: Create an invitation
    console.log('1️⃣ Creating invitation for:', TEST_EMAIL);
    const inviteResponse = await axios.post(
      `${API_URL}/admin/users/invite`,
      {
        email: TEST_EMAIL,
        role: 'INVESTOR',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '+1234567890',
        dateOfBirth: '1990-01-01',
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'USA'
      },
      {
        headers: {
          'Authorization': 'Bearer mock-token',
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Invitation created successfully!');
    console.log('   Invitation ID:', inviteResponse.data.data.id);
    console.log('   Email:', inviteResponse.data.data.email_address);
    console.log('   Status:', inviteResponse.data.data.status);
    console.log('\n');

    // Step 2: List invitations
    console.log('2️⃣ Listing all invitations...');
    const listResponse = await axios.get(
      `${API_URL}/admin/invitations`,
      {
        headers: {
          'Authorization': 'Bearer mock-token'
        }
      }
    );

    console.log('✅ Found', listResponse.data.data.length, 'invitation(s)');
    listResponse.data.data.forEach((inv, index) => {
      console.log(`   ${index + 1}. ${inv.email_address} - ${inv.status}`);
    });
    console.log('\n');

    // Step 3: Check webhook endpoint is accessible
    console.log('3️⃣ Checking webhook endpoint...');
    try {
      await axios.post(
        `${API_URL}/webhooks/clerk`,
        {
          type: 'test',
          data: {}
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Webhook endpoint is accessible');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Webhook endpoint is accessible (returned expected error for test payload)');
      } else {
        console.log('⚠️ Webhook endpoint returned unexpected response');
      }
    }
    console.log('\n');

    console.log('🎉 Test completed successfully!');
    console.log('\nNext steps:');
    console.log('1. The user should receive an email invitation at:', TEST_EMAIL);
    console.log('2. When they accept the invitation, Clerk will send a webhook to our endpoint');
    console.log('3. The webhook handler will create the user record with all the metadata');
    console.log('\nNote: In development mode, emails might not be sent. Check Clerk dashboard for invitation status.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the test
testInvitationFlow();