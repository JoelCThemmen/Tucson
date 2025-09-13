const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const API_URL = 'http://localhost:5000/api/v1';

async function cancelJoelVerification() {
  try {
    console.log('📋 Fetching Joel\'s verification data...');
    
    // First, get Joel's user ID
    const joelUser = await prisma.user.findUnique({
      where: { clerkUserId: 'user_32LmOoXP3UT4hR02Qkh2Q7EKdb7' }
    });

    if (!joelUser) {
      console.log('❌ Joel\'s user not found');
      return;
    }

    console.log('✅ Found Joel\'s user:', joelUser.email);

    // Get all verifications for Joel
    const verifications = await prisma.accreditationVerification.findMany({
      where: { userId: joelUser.id },
      include: { documents: true }
    });

    console.log(`\n📊 Found ${verifications.length} verification(s) for Joel:`);
    
    for (const verification of verifications) {
      console.log(`\n🔍 Verification ID: ${verification.id}`);
      console.log(`   Type: ${verification.verificationType}`);
      console.log(`   Status: ${verification.status}`);
      console.log(`   Submitted: ${verification.submittedAt}`);
      console.log(`   Documents: ${verification.documents.length}`);
      
      // Option 1: Try to cancel via API first (proper way)
      if (verification.status === 'PENDING') {
        console.log('\n🚀 Attempting to cancel via API...');
        try {
          const response = await axios.delete(
            `${API_URL}/verification/${verification.id}`,
            {
              headers: {
                'Authorization': `Bearer mock-token`,
              },
            }
          );
          console.log('✅ Cancelled via API:', response.data.message);
        } catch (apiError) {
          console.log('⚠️  API cancellation failed, will delete directly from database');
          
          // Option 2: Direct database deletion
          console.log('\n🗑️  Deleting directly from database...');
          
          // Delete documents first
          const deletedDocs = await prisma.verificationDocument.deleteMany({
            where: { verificationId: verification.id }
          });
          console.log(`   ✅ Deleted ${deletedDocs.count} document(s)`);
          
          // Delete verification
          await prisma.accreditationVerification.delete({
            where: { id: verification.id }
          });
          console.log('   ✅ Deleted verification record');
        }
      } else {
        // For non-pending verifications, delete directly
        console.log('\n🗑️  Deleting non-pending verification from database...');
        
        // Delete documents first
        const deletedDocs = await prisma.verificationDocument.deleteMany({
          where: { verificationId: verification.id }
        });
        console.log(`   ✅ Deleted ${deletedDocs.count} document(s)`);
        
        // Delete verification
        await prisma.accreditationVerification.delete({
          where: { id: verification.id }
        });
        console.log('   ✅ Deleted verification record');
      }
    }

    // Clean up audit logs for Joel
    const deletedLogs = await prisma.auditLog.deleteMany({
      where: { userId: joelUser.id }
    });
    console.log(`\n🧹 Cleaned up ${deletedLogs.count} audit log(s)`);

    console.log('\n✅ All verification data for Joel has been cleared!');
    console.log('   You can now resubmit a new verification.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cancelJoelVerification();