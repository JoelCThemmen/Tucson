const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteJoelVerification() {
  try {
    console.log('🗑️  Completely removing Joel\'s verification data...\n');
    
    // Get Joel's user
    const joelUser = await prisma.user.findUnique({
      where: { clerkUserId: 'user_32LmOoXP3UT4hR02Qkh2Q7EKdb7' }
    });

    if (!joelUser) {
      console.log('❌ Joel\'s user not found');
      return;
    }

    console.log('✅ Found Joel\'s user:', joelUser.email);
    console.log('   User ID:', joelUser.id);

    // Delete all verification documents for Joel
    const deletedDocs = await prisma.verificationDocument.deleteMany({
      where: {
        verification: {
          userId: joelUser.id
        }
      }
    });
    console.log(`\n✅ Deleted ${deletedDocs.count} verification document(s)`);

    // Delete all verifications for Joel
    const deletedVerifications = await prisma.accreditationVerification.deleteMany({
      where: { userId: joelUser.id }
    });
    console.log(`✅ Deleted ${deletedVerifications.count} verification record(s)`);

    // Clean up audit logs related to verification
    const deletedLogs = await prisma.auditLog.deleteMany({
      where: { 
        userId: joelUser.id,
        action: {
          startsWith: 'verification'
        }
      }
    });
    console.log(`✅ Deleted ${deletedLogs.count} verification-related audit log(s)`);

    console.log('\n✅ All verification data for Joel has been completely removed!');
    console.log('   You can now submit a fresh verification.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteJoelVerification();