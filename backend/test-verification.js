const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api/v1';

// Mock user for development
const mockUserId = 'user_123456789';

async function testVerificationFlow() {
  try {
    console.log('1. Submitting verification request...');
    
    // Submit verification request for Joel Themmen
    const verificationResponse = await axios.post(
      `${API_URL}/verification/submit`,
      {
        verificationType: 'NET_WORTH',
        netWorth: 1500000,
        liquidNetWorth: 500000,
        attestation: true,
        consentToVerify: true,
      },
      {
        headers: {
          'Authorization': `Bearer mock-token`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Verification submitted:', verificationResponse.data);
    const verificationId = verificationResponse.data.data.id;

    // Create a test bank statement file
    const testPdfContent = Buffer.from('This is Joel Themmen bank statement showing net worth verification');
    const testFileName = 'bank-statement-2024.pdf';
    
    console.log('\n2. Uploading test document...');
    
    // Create form data for document upload
    const formData = new FormData();
    formData.append('documents', testPdfContent, {
      filename: testFileName,
      contentType: 'application/pdf',
    });
    formData.append('documentTypes', JSON.stringify(['BANK_STATEMENT']));

    // Upload document
    const documentResponse = await axios.post(
      `${API_URL}/verification/${verificationId}/documents`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer mock-token`,
        },
      }
    );

    console.log('✅ Document uploaded:', documentResponse.data);

    // Get verification status
    console.log('\n3. Checking verification status...');
    const statusResponse = await axios.get(
      `${API_URL}/verification/status`,
      {
        headers: {
          'Authorization': `Bearer mock-token`,
        },
      }
    );

    console.log('✅ Verification status:', JSON.stringify(statusResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Run the test
testVerificationFlow();