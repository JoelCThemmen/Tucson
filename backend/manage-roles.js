const { PrismaClient, UserRole } = require('@prisma/client');
const prisma = new PrismaClient();

async function setUserRole(email, role) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    console.log('✅ User role updated successfully:');
    console.log('   Name:', updatedUser.firstName, updatedUser.lastName);
    console.log('   Email:', updatedUser.email);
    console.log('   New Role:', updatedUser.role);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: updatedUser.id,
        action: 'role.changed_via_script',
        details: {
          oldRole: user.role,
          newRole: role,
          changedBy: 'System Administrator',
        },
      },
    });

    console.log('   Audit log created');
  } catch (error) {
    console.error('❌ Error updating user role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('\n📋 All Users:\n');
    console.log('Role        | Email                           | Name');
    console.log('----------- | ------------------------------- | ---------------------');
    
    users.forEach(user => {
      const role = (user.role || 'INVESTOR').padEnd(10);
      const email = user.email.padEnd(30);
      const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      console.log(`${role} | ${email} | ${name}`);
    });

    console.log(`\nTotal users: ${users.length}`);

    // Count by role
    const roleCounts = {};
    users.forEach(user => {
      const role = user.role || 'INVESTOR';
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });

    console.log('\nUsers by role:');
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`  ${role}: ${count}`);
    });
  } catch (error) {
    console.error('❌ Error listing users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Parse command line arguments
const command = process.argv[2];
const email = process.argv[3];
const role = process.argv[4];

if (command === 'set-role') {
  if (!email || !role) {
    console.log('Usage: node manage-roles.js set-role <email> <role>');
    console.log('Roles: INVESTOR, ADMIN, SUPER_ADMIN');
    console.log('\nExample: node manage-roles.js set-role joel.themmen@gmail.com ADMIN');
    process.exit(1);
  }

  if (!Object.values(UserRole).includes(role)) {
    console.log(`❌ Invalid role: ${role}`);
    console.log('Valid roles: INVESTOR, ADMIN, SUPER_ADMIN');
    process.exit(1);
  }

  setUserRole(email, role);
} else if (command === 'list') {
  listUsers();
} else if (command === 'make-joel-admin') {
  // Shortcut to make Joel an admin
  console.log('🔧 Setting Joel Themmen as ADMIN...\n');
  setUserRole('joel.themmen@gmail.com', UserRole.ADMIN);
} else {
  console.log('📚 Role Management Tool\n');
  console.log('Commands:');
  console.log('  node manage-roles.js list                              - List all users and their roles');
  console.log('  node manage-roles.js set-role <email> <role>          - Set user role');
  console.log('  node manage-roles.js make-joel-admin                  - Make Joel Themmen an admin');
  console.log('\nRoles: INVESTOR, ADMIN, SUPER_ADMIN');
  console.log('\nExamples:');
  console.log('  node manage-roles.js list');
  console.log('  node manage-roles.js set-role user@example.com ADMIN');
  console.log('  node manage-roles.js make-joel-admin');
}