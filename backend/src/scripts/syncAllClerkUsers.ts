import { PrismaClient } from '@prisma/client';
import { clerkClient } from '@clerk/clerk-sdk-node';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function syncAllUsers() {
  try {
    console.log('Fetching all users from Clerk...');
    
    // Get all users from Clerk
    const users = await clerkClient.users.getUserList();
    console.log(`Found ${users.length} users in Clerk`);
    
    for (const clerkUser of users) {
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      if (!email) continue;
      
      console.log(`\nProcessing user: ${email} (${clerkUser.id})`);
      
      // Check if user already exists in database
      const existingUser = await prisma.user.findUnique({
        where: { clerkUserId: clerkUser.id }
      });
      
      if (existingUser) {
        console.log('  ✓ User already exists in database');
        continue;
      }
      
      // Create user in database
      const newUser = await prisma.user.create({
        data: {
          clerkUserId: clerkUser.id,
          email: email,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          profile: {
            create: {
              avatarUrl: clerkUser.imageUrl
            }
          }
        },
        include: {
          profile: true
        }
      });
      
      console.log('  ✓ User created successfully');
      
      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: newUser.id,
          action: 'USER_CREATED',
          details: {
            source: 'bulk_sync',
            clerkUserId: clerkUser.id
          }
        }
      });
      
      console.log('  ✓ Audit log created');
    }
    
    console.log('\n✅ All users synced successfully');
    
    // Show all users in database
    console.log('\nUsers in database:');
    const dbUsers = await prisma.user.findMany();
    for (const user of dbUsers) {
      console.log(`  - ${user.email} (Clerk ID: ${user.clerkUserId})`);
    }
    
  } catch (error) {
    console.error('Error syncing users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the sync
syncAllUsers();