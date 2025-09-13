const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkJoelUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkUserId: 'user_32LmOoXP3UT4hR02Qkh2Q7EKdb7' },
      include: { profile: true }
    });

    if (user) {
      console.log('✅ Joel Themmen user found:');
      console.log('  ID:', user.id);
      console.log('  Email:', user.email);
      console.log('  Name:', user.firstName, user.lastName);
      console.log('  Created:', user.createdAt);
    } else {
      console.log('❌ Joel Themmen user not found. Creating...');
      
      const newUser = await prisma.user.create({
        data: {
          clerkUserId: 'user_32LmOoXP3UT4hR02Qkh2Q7EKdb7',
          email: 'joel.themmen@gmail.com',
          firstName: 'Joel',
          lastName: 'Themmen',
          profile: {
            create: {
              bio: 'Software Engineer',
              company: 'Tucson',
              position: 'Founder'
            }
          }
        },
        include: { profile: true }
      });
      
      console.log('✅ Created Joel Themmen user:', newUser);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkJoelUser();