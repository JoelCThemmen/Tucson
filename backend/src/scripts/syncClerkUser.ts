import { PrismaClient } from '@prisma/client';
import { clerkClient } from '@clerk/clerk-sdk-node';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function syncUserFromClerk(email: string) {
  try {
    console.log(`Looking for user with email: ${email}`);
    
    // Get all users from Clerk and find the one with matching email
    const users = await clerkClient.users.getUserList();
    const clerkUser = users.find(user => 
      user.emailAddresses.some(e => e.emailAddress.toLowerCase() === email.toLowerCase())
    );
    
    if (!clerkUser) {
      console.error(`User with email ${email} not found in Clerk`);
      return;
    }
    
    console.log(`Found Clerk user: ${clerkUser.id}`);
    
    // Check if user already exists in database
    const existingUser = await prisma.user.findUnique({
      where: { clerkUserId: clerkUser.id }
    });
    
    if (existingUser) {
      console.log('User already exists in database:', existingUser);
      return;
    }
    
    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        clerkUserId: clerkUser.id,
        email: clerkUser.emailAddresses[0].emailAddress,
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
    
    console.log('User synced successfully:', newUser);
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: newUser.id,
        action: 'USER_CREATED',
        details: {
          source: 'manual_sync',
          clerkUserId: clerkUser.id
        }
      }
    });
    
    console.log('Audit log created');
    
  } catch (error) {
    console.error('Error syncing user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the sync for the specified email
const email = process.argv[2] || 'joel.themmen@gmail.com';
syncUserFromClerk(email);