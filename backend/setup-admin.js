#!/usr/bin/env node

/**
 * Script to set up an admin user in the database
 * Usage: node setup-admin.js <clerkUserId> <email>
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupAdmin() {
  const clerkUserId = process.argv[2];
  const email = process.argv[3] || 'joel.themmen@gmail.com';

  if (!clerkUserId) {
    console.error('❌ Please provide your Clerk User ID');
    console.error('Usage: node setup-admin.js <clerkUserId> [email]');
    console.error('\nTo find your Clerk User ID:');
    console.error('1. Log into your app');
    console.error('2. Open browser DevTools (F12)');
    console.error('3. Go to Application > Local Storage');
    console.error('4. Look for a key like __clerk_db_jwt or check the Network tab for API calls');
    console.error('5. The user ID looks like: user_2abc123...');
    console.error('\nOR check the Clerk Dashboard > Users section');
    process.exit(1);
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { clerkUserId }
    });

    if (existingUser) {
      // Update existing user to admin
      const updatedUser = await prisma.user.update({
        where: { clerkUserId },
        data: {
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
          isEmailVerified: true
        }
      });
      console.log('✅ Updated existing user to SUPER_ADMIN:', updatedUser.email);
    } else {
      // Create new admin user
      const newUser = await prisma.user.create({
        data: {
          clerkUserId,
          email,
          firstName: 'Joel',
          lastName: 'Themmen',
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
          isEmailVerified: true,
          profile: {
            create: {}
          }
        }
      });
      console.log('✅ Created new SUPER_ADMIN user:', newUser.email);
    }

    console.log('\n🎉 Admin setup complete!');
    console.log('You should now be able to access the admin panel.');
    
  } catch (error) {
    console.error('❌ Error setting up admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupAdmin();