const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedTestUser() {
  try {
    // Create a test user
    const user = await prisma.user.create({
      data: {
        clerkUserId: 'user_123456789',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      },
    });

    console.log('✅ Test user created:', user);
    
    // Create user profile
    const profile = await prisma.userProfile.create({
      data: {
        userId: user.id,
        bio: 'Test user for verification',
        company: 'Test Company',
        position: 'Software Engineer',
      },
    });

    console.log('✅ User profile created:', profile);

  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️ Test user already exists');
      const existingUser = await prisma.user.findUnique({
        where: { clerkUserId: 'user_123456789' },
      });
      console.log('Existing user:', existingUser);
    } else {
      console.error('Error creating test user:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

seedTestUser();