const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupVerificationData() {
  try {
    // Delete all verification documents first (due to foreign key constraint)
    const deletedDocs = await prisma.verificationDocument.deleteMany({});
    console.log(`✅ Deleted ${deletedDocs.count} verification documents`);

    // Delete all verification records
    const deletedVerifications = await prisma.accreditationVerification.deleteMany({});
    console.log(`✅ Deleted ${deletedVerifications.count} verification records`);

    // Delete all audit logs
    const deletedAuditLogs = await prisma.auditLog.deleteMany({});
    console.log(`✅ Deleted ${deletedAuditLogs.count} audit logs`);

    console.log('\n✅ All verification data cleared successfully!');

  } catch (error) {
    console.error('❌ Error cleaning up verification data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupVerificationData();