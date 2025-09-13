const { PrismaClient, UserRole, UserStatus } = require('@prisma/client');
const { clerkClient } = require('@clerk/clerk-sdk-node');
require('dotenv').config();

const prisma = new PrismaClient();

async function syncClerkUsers() {
  try {
    console.log('🔄 Starting Clerk user sync...');
    
    // Fetch all users from Clerk
    const clerkUsers = await clerkClient.users.getUserList({ limit: 100 });
    console.log(`📊 Found ${clerkUsers.length} users in Clerk`);
    
    // Get all existing users from database
    const dbUsers = await prisma.user.findMany({
      select: { clerkUserId: true, email: true }
    });
    const dbUserIds = new Set(dbUsers.map(u => u.clerkUserId));
    const dbUserEmails = new Set(dbUsers.map(u => u.email));
    
    console.log(`📊 Found ${dbUsers.length} users in database`);
    
    // Find missing users
    const missingUsers = clerkUsers.filter(
      clerkUser => !dbUserIds.has(clerkUser.id)
    );
    
    console.log(`🔍 Found ${missingUsers.length} users missing from database`);
    
    // Create missing users
    for (const clerkUser of missingUsers) {
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      
      if (!email) {
        console.warn(`⚠️ Skipping user ${clerkUser.id} - no email address`);
        continue;
      }
      
      // Check if email already exists (edge case)
      if (dbUserEmails.has(email)) {
        console.warn(`⚠️ Email ${email} already exists in database, skipping`);
        continue;
      }
      
      console.log(`➕ Creating user: ${email}`);
      
      // Extract metadata (from invitation or user metadata)
      const metadata = clerkUser.publicMetadata || {};
      const privateMetadata = clerkUser.privateMetadata || {};
      
      // Convert gender to uppercase enum value
      const convertGender = (gender) => {
        if (!gender) return undefined;
        const genderMap = {
          'male': 'MALE',
          'female': 'FEMALE',
          'other': 'OTHER',
          'prefer_not_to_say': 'PREFER_NOT_TO_SAY'
        };
        return genderMap[gender.toLowerCase()] || undefined;
      };
      
      try {
        const user = await prisma.user.create({
          data: {
            clerkUserId: clerkUser.id,
            email,
            firstName: metadata.firstName || clerkUser.firstName,
            lastName: metadata.lastName || clerkUser.lastName,
            role: metadata.role || UserRole.INVESTOR,
            status: UserStatus.ACTIVE,
            isEmailVerified: true,
            activatedAt: new Date(clerkUser.createdAt),
            
            // Demographic fields from metadata
            dateOfBirth: metadata.dateOfBirth ? new Date(metadata.dateOfBirth) : undefined,
            gender: convertGender(metadata.gender),
            ethnicity: metadata.ethnicity,
            country: metadata.country,
            state: metadata.state,
            city: metadata.city,
            postalCode: metadata.postalCode,
            phoneNumber: metadata.phoneNumber,
            alternateEmail: metadata.alternateEmail,
            occupation: metadata.occupation,
            employer: metadata.employer,
            industry: metadata.industry,
            yearsExperience: metadata.yearsExperience,
            notes: metadata.notes,
            tags: metadata.tags || [],
            addedBy: metadata.addedBy,
            
            // Create profile
            profile: {
              create: {
                phone: metadata.phoneNumber,
                location: metadata.city && metadata.state 
                  ? `${metadata.city}, ${metadata.state}` 
                  : undefined,
                company: metadata.employer,
                position: metadata.occupation,
                investmentPreferences: metadata.investmentGoals,
                riskTolerance: metadata.riskTolerance,
                preferences: {
                  dateOfBirth: metadata.dateOfBirth,
                  address: metadata.address,
                  city: metadata.city,
                  state: metadata.state,
                  zipCode: metadata.zipCode,
                  country: metadata.country,
                  gender: metadata.gender,
                  ethnicity: metadata.ethnicity,
                  investmentExperience: metadata.investmentExperience,
                  expectedInvestmentAmount: metadata.expectedInvestmentAmount,
                  accreditedInvestor: metadata.accreditedInvestor,
                  sourceOfFunds: metadata.sourceOfFunds,
                }
              }
            }
          },
          include: {
            profile: true
          }
        });
        
        console.log(`✅ Created user: ${user.email} (${user.id})`);
        
        // Create audit log
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'user.synced_from_clerk',
            details: { 
              clerkUserId: clerkUser.id, 
              email,
              source: 'manual_sync'
            }
          }
        });
        
      } catch (error) {
        console.error(`❌ Failed to create user ${email}:`, error.message);
      }
    }
    
    console.log('✅ Sync completed successfully!');
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the sync
syncClerkUsers();