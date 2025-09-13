import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { isAdmin, isSuperAdmin, attachUser } from '../middleware/role.middleware';
import { VerificationService } from '../services/verification.service';
import { userService } from '../services/user.service';
import { emailService } from '../services/email.service';
import { AppError } from '../middleware/error.middleware';
import { UserRole, UserStatus, Gender, VerificationStatus } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { clerkClient } from '@clerk/clerk-sdk-node';

const router = Router();
const prisma = new PrismaClient();

/**
 * Get admin dashboard statistics
 * GET /api/admin/dashboard
 */
router.get(
  '/dashboard',
  requireAuth as any,
  attachUser,
  isAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get statistics
      const [
        totalUsers,
        totalVerifications,
        pendingVerifications,
        approvedVerifications,
        rejectedVerifications,
        recentVerifications,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.accreditationVerification.count(),
        prisma.accreditationVerification.count({
          where: { status: VerificationStatus.PENDING },
        }),
        prisma.accreditationVerification.count({
          where: { status: VerificationStatus.APPROVED },
        }),
        prisma.accreditationVerification.count({
          where: { status: VerificationStatus.REJECTED },
        }),
        prisma.accreditationVerification.findMany({
          take: 10,
          orderBy: { submittedAt: 'desc' },
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            documents: {
              select: {
                id: true,
                documentType: true,
                fileName: true,
              },
            },
          },
        }),
      ]);

      res.json({
        success: true,
        data: {
          statistics: {
            totalUsers,
            totalVerifications,
            pendingVerifications,
            approvedVerifications,
            rejectedVerifications,
          },
          recentVerifications,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get all users (admin only)
 * GET /api/admin/users
 */
router.get(
  '/users',
  requireAuth as any,
  attachUser,
  isAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 20, search, role } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      
      if (search) {
        where.OR = [
          { email: { contains: String(search), mode: 'insensitive' } },
          { firstName: { contains: String(search), mode: 'insensitive' } },
          { lastName: { contains: String(search), mode: 'insensitive' } },
        ];
      }

      if (role) {
        where.role = role as UserRole;
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            profile: true,
            _count: {
              select: {
                verifications: true,
              },
            },
          },
        }),
        prisma.user.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get all verifications (admin only)
 * GET /api/admin/verifications
 */
router.get(
  '/verifications',
  requireAuth as any,
  attachUser,
  isAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 20, status, type } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      
      if (status) {
        where.status = status as VerificationStatus;
      }

      if (type) {
        where.verificationType = type;
      }

      const [verifications, total] = await Promise.all([
        prisma.accreditationVerification.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { submittedAt: 'desc' },
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
            documents: {
              select: {
                id: true,
                documentType: true,
                fileName: true,
                virusScanStatus: true,
              },
            },
          },
        }),
        prisma.accreditationVerification.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          verifications,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Update user role (super admin only)
 * PUT /api/admin/users/:userId/role
 */
router.put(
  '/users/:userId/role',
  requireAuth as any,
  attachUser,
  isSuperAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!Object.values(UserRole).includes(role)) {
        throw new AppError('Invalid role', 400);
      }

      // Prevent demoting yourself
      if (userId === req.user!.id && role !== req.user!.role) {
        throw new AppError('Cannot change your own role', 400);
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'user.role_changed',
          details: {
            targetUserId: userId,
            oldRole: req.user!.role,
            newRole: role,
          },
        },
      });

      res.json({
        success: true,
        message: 'User role updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get audit logs (admin only)
 * GET /api/admin/audit-logs
 */
router.get(
  '/audit-logs',
  requireAuth as any,
  attachUser,
  isAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 50, userId, action } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      
      if (userId) {
        where.userId = String(userId);
      }

      if (action) {
        where.action = { contains: String(action) };
      }

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        }),
        prisma.auditLog.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          logs,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Batch approve/reject verifications (admin only)
 * POST /api/admin/verifications/batch-review
 */
router.post(
  '/verifications/batch-review',
  requireAuth as any,
  attachUser,
  isAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { verificationIds, status, notes } = req.body;

      if (!verificationIds || !Array.isArray(verificationIds)) {
        throw new AppError('Verification IDs must be an array', 400);
      }

      if (!['APPROVED', 'REJECTED'].includes(status)) {
        throw new AppError('Invalid status', 400);
      }

      const results = await Promise.all(
        verificationIds.map(async (id: string) => {
          try {
            const updated = await VerificationService.updateVerificationStatus(
              id,
              status as any,
              req.user!.id,
              notes,
              status === 'REJECTED' ? 'Batch rejection by admin' : undefined
            );
            return { id, success: true, status };
          } catch (error) {
            return { id, success: false, error: (error as Error).message };
          }
        })
      );

      res.json({
        success: true,
        message: `Batch review completed`,
        data: {
          results,
          successful: results.filter((r) => r.success).length,
          failed: results.filter((r) => !r.success).length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Invite a new user using Clerk (admin only)
 * POST /api/admin/users/invite
 * 
 * This replaces the direct user creation with Clerk's invitation system
 */
router.post(
  '/users/invite',
  requireAuth as any,
  attachUser,
  isAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        email,
        firstName,
        lastName,
        role,
        notes,
        tags,
        // Demographic data to be saved as metadata
        dateOfBirth,
        gender,
        ethnicity,
        country,
        state,
        city,
        postalCode,
        phoneNumber,
        alternateEmail,
        occupation,
        employer,
        industry,
        yearsExperience,
      } = req.body;

      // Validate required fields
      if (!email) {
        throw new AppError('Email is required', 400);
      }

      // Check if user already exists in our database
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new AppError('User with this email already exists', 400);
      }

      // In development mode without Clerk, use the old flow
      if (process.env.NODE_ENV === 'development' && !process.env.CLERK_SECRET_KEY) {
        // Fallback to custom invitation for development
        return await createCustomInvitation(req, res, next);
      }

      // Create Clerk invitation with metadata
      const invitation = await clerkClient.invitations.createInvitation({
        emailAddress: email,
        publicMetadata: {
          // This metadata will be available on the user after they sign up
          role: role || UserRole.INVESTOR,
          addedBy: req.user!.id,
          firstName,
          lastName,
          notes,
          tags: tags || [],
          // Demographic data
          dateOfBirth,
          gender,
          ethnicity,
          country,
          state,
          city,
          postalCode,
          phoneNumber,
          alternateEmail,
          occupation,
          employer,
          industry,
          yearsExperience,
        },
        redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/welcome`,
        notify: true, // Send email invitation
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'admin.invitation_sent',
          details: {
            email,
            invitationId: invitation.id,
            role: role || UserRole.INVESTOR,
          },
        },
      });

      res.status(201).json({
        success: true,
        message: 'Invitation sent successfully',
        data: {
          invitationId: invitation.id,
          email: invitation.emailAddress,
          status: invitation.status,
          createdAt: invitation.createdAt,
          expiresAt: new Date(invitation.createdAt + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });
    } catch (error: any) {
      // Handle Clerk-specific errors
      if (error.errors) {
        const clerkError = error.errors[0];
        if (clerkError.code === 'form_identifier_exists') {
          return next(new AppError('An invitation has already been sent to this email', 400));
        }
        return next(new AppError(clerkError.message, 400));
      }
      next(error);
    }
  }
);

/**
 * Get pending invitations (admin only)
 * GET /api/admin/invitations
 */
router.get(
  '/invitations',
  requireAuth as any,
  attachUser,
  isAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // In development mode without Clerk, return empty
      if (process.env.NODE_ENV === 'development' && !process.env.CLERK_SECRET_KEY) {
        return res.json({
          success: true,
          data: {
            invitations: [],
            total: 0,
          },
        });
      }

      // Get invitations from Clerk
      const invitations = await clerkClient.invitations.getInvitationList({
        status: 'pending' as any,
      });

      res.json({
        success: true,
        data: {
          invitations: invitations.map(inv => ({
            id: inv.id,
            email: inv.emailAddress,
            status: inv.status,
            createdAt: inv.createdAt,
            publicMetadata: inv.publicMetadata,
            expiresAt: new Date(inv.createdAt + 30 * 24 * 60 * 60 * 1000),
          })),
          total: invitations.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Revoke an invitation (admin only)
 * POST /api/admin/invitations/:invitationId/revoke
 */
router.post(
  '/invitations/:invitationId/revoke',
  requireAuth as any,
  attachUser,
  isAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { invitationId } = req.params;

      // In development mode without Clerk, return success
      if (process.env.NODE_ENV === 'development' && !process.env.CLERK_SECRET_KEY) {
        return res.json({
          success: true,
          message: 'Invitation revoked (dev mode)',
        });
      }

      // Revoke the invitation in Clerk
      await clerkClient.invitations.revokeInvitation(invitationId);

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'admin.invitation_revoked',
          details: {
            invitationId,
          },
        },
      });

      res.json({
        success: true,
        message: 'Invitation revoked successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Fallback function for custom invitation in development
 */
async function createCustomInvitation(req: Request, res: Response, next: NextFunction) {
  const {
    email,
    firstName,
    lastName,
    role,
    status,
    dateOfBirth,
    gender,
    ethnicity,
    country,
    state,
    city,
    postalCode,
    phoneNumber,
    alternateEmail,
    occupation,
    employer,
    industry,
    yearsExperience,
    notes,
    tags,
    temporaryPassword,
  } = req.body;

  // Generate a unique Clerk ID (placeholder for dev)
  const clerkUserId = `user_${crypto.randomBytes(16).toString('hex')}`;
  
  // Generate activation token and temporary password
  const activationToken = crypto.randomBytes(32).toString('hex');
  const activationExpiry = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours
  const generatedPassword = temporaryPassword || crypto.randomBytes(8).toString('hex');
  
  // Hash the temporary password if provided
  let passwordHash = null;
  if (temporaryPassword) {
    passwordHash = await bcrypt.hash(temporaryPassword, 10);
  }
  
  // Set status to PENDING if not specified
  const userStatus = status || UserStatus.PENDING;

  // Create the user
  const newUser = await prisma.user.create({
    data: {
      clerkUserId,
      email,
      firstName,
      lastName,
      role: role || UserRole.INVESTOR,
      status: userStatus,
      activationToken,
      activationExpiry,
      passwordHash,
      isEmailVerified: false,
      invitedAt: new Date(),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender: gender as Gender,
      ethnicity,
      country,
      state,
      city,
      postalCode,
      phoneNumber,
      alternateEmail,
      occupation,
      employer,
      industry,
      yearsExperience,
      notes,
      tags: tags || [],
      addedBy: req.user!.id,
    },
    include: {
      profile: true,
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId: req.user!.id,
      action: 'admin.user_created',
      details: {
        newUserId: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
    },
  });

  // Send invitation email
  await emailService.sendInvitationEmail(
    email,
    firstName || '',
    activationToken,
    generatedPassword
  );

  res.status(201).json({
    success: true,
    message: 'User created successfully. An invitation email has been sent (dev mode).',
    data: {
      user: newUser,
    },
  });
}

/**
 * Create a new user (admin only) - DEPRECATED: Use /invite instead
 * POST /api/admin/users
 * 
 * Kept for backwards compatibility but redirects to invite
 */
router.post(
  '/users',
  requireAuth as any,
  attachUser,
  isAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    // Simply forward to the new invite endpoint
    res.redirect(307, '/api/v1/admin/users/invite');
  }
);

/**
 * Update user details (admin only)
 * PUT /api/admin/users/:userId
 */
router.put(
  '/users/:userId',
  requireAuth as any,
  attachUser,
  isAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const updateData = req.body;

      // Remove fields that shouldn't be updated directly
      delete updateData.id;
      delete updateData.clerkUserId;
      delete updateData.createdAt;
      delete updateData.updatedAt;
      delete updateData.addedBy;

      // Handle date conversion
      if (updateData.dateOfBirth) {
        updateData.dateOfBirth = new Date(updateData.dateOfBirth);
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        include: {
          profile: true,
          _count: {
            select: {
              verifications: true,
            },
          },
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'admin.user_updated',
          details: {
            targetUserId: userId,
            changes: updateData,
          },
        },
      });

      res.json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Delete user (super admin only)
 * DELETE /api/admin/users/:userId
 */
router.delete(
  '/users/:userId',
  requireAuth as any,
  attachUser,
  isSuperAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      // Prevent deleting yourself
      if (userId === req.user!.id) {
        throw new AppError('Cannot delete your own account', 400);
      }

      // Get user details before deletion
      const userToDelete = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          firstName: true,
          lastName: true,
        },
      });

      if (!userToDelete) {
        throw new AppError('User not found', 404);
      }

      // Delete user (cascade will handle related records)
      await prisma.user.delete({
        where: { id: userId },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'admin.user_deleted',
          details: {
            deletedUserId: userId,
            deletedUserEmail: userToDelete.email,
            deletedUserName: `${userToDelete.firstName} ${userToDelete.lastName}`,
          },
        },
      });

      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Sync users from Clerk to database (super admin only)
 * POST /api/admin/users/sync-clerk
 */
router.post(
  '/users/sync-clerk',
  requireAuth as any,
  attachUser,
  isSuperAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
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
      
      const results = {
        total: clerkUsers.length,
        existing: dbUsers.length,
        missing: missingUsers.length,
        created: 0,
        failed: 0,
        errors: [] as string[]
      };
      
      // Helper function to convert gender
      const convertGender = (gender: string | undefined) => {
        if (!gender) return undefined;
        const genderMap: Record<string, any> = {
          'male': 'MALE',
          'female': 'FEMALE',
          'other': 'OTHER',
          'prefer_not_to_say': 'PREFER_NOT_TO_SAY'
        };
        return genderMap[gender.toLowerCase()] || undefined;
      };
      
      // Create missing users
      for (const clerkUser of missingUsers) {
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        
        if (!email) {
          console.warn(`⚠️ Skipping user ${clerkUser.id} - no email address`);
          results.errors.push(`User ${clerkUser.id} has no email address`);
          results.failed++;
          continue;
        }
        
        // Check if email already exists (edge case)
        if (dbUserEmails.has(email)) {
          console.warn(`⚠️ Email ${email} already exists in database, skipping`);
          results.errors.push(`Email ${email} already exists`);
          results.failed++;
          continue;
        }
        
        console.log(`➕ Creating user: ${email}`);
        
        // Extract metadata with proper typing
        const metadata: any = clerkUser.publicMetadata || {};
        
        try {
          const user = await prisma.user.create({
            data: {
              clerkUserId: clerkUser.id,
              email,
              firstName: (metadata.firstName || clerkUser.firstName) as string,
              lastName: (metadata.lastName || clerkUser.lastName) as string,
              role: (metadata.role || UserRole.INVESTOR) as UserRole,
              status: UserStatus.ACTIVE,
              isEmailVerified: true,
              activatedAt: new Date(clerkUser.createdAt),
              
              // Demographic fields from metadata
              dateOfBirth: metadata.dateOfBirth ? new Date(metadata.dateOfBirth) : undefined,
              gender: convertGender(metadata.gender as string),
              ethnicity: metadata.ethnicity as string || undefined,
              country: metadata.country as string || undefined,
              state: metadata.state as string || undefined,
              city: metadata.city as string || undefined,
              postalCode: metadata.postalCode as string || undefined,
              phoneNumber: metadata.phoneNumber as string || undefined,
              alternateEmail: metadata.alternateEmail as string || undefined,
              occupation: metadata.occupation as string || undefined,
              employer: metadata.employer as string || undefined,
              industry: metadata.industry as string || undefined,
              yearsExperience: metadata.yearsExperience ? Number(metadata.yearsExperience) : undefined,
              notes: metadata.notes as string || undefined,
              tags: (metadata.tags || []) as string[],
              addedBy: metadata.addedBy as string || undefined,
              
              // Create profile
              profile: {
                create: {
                  phone: metadata.phoneNumber as string || undefined,
                  location: metadata.city && metadata.state 
                    ? `${metadata.city}, ${metadata.state}` 
                    : undefined,
                  company: metadata.employer as string || undefined,
                  position: metadata.occupation as string || undefined,
                  investmentPreferences: metadata.investmentGoals as string || undefined,
                  riskTolerance: metadata.riskTolerance as string || undefined,
                  preferences: metadata.dateOfBirth || metadata.address || metadata.city ? {
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
                  } : undefined
                }
              }
            },
            include: {
              profile: true
            }
          });
          
          console.log(`✅ Created user: ${user.email} (${user.id})`);
          results.created++;
          
          // Create audit log
          await prisma.auditLog.create({
            data: {
              userId: user.id,
              action: 'user.synced_from_clerk',
              details: { 
                clerkUserId: clerkUser.id, 
                email,
                source: 'admin_sync',
                syncedBy: req.user!.email
              }
            }
          });
          
        } catch (error: any) {
          console.error(`❌ Failed to create user ${email}:`, error.message);
          results.errors.push(`Failed to create ${email}: ${error.message}`);
          results.failed++;
        }
      }
      
      // Create audit log for the sync operation
      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'admin.clerk_sync',
          details: {
            results,
            timestamp: new Date().toISOString()
          }
        }
      });
      
      res.json({
        success: true,
        message: `Sync completed. Created ${results.created} users, ${results.failed} failed.`,
        data: results
      });
      
    } catch (error) {
      console.error('❌ Sync failed:', error);
      next(error);
    }
  }
);

/**
 * Get user statistics (admin only)
 * GET /api/admin/users/statistics
 */
router.get(
  '/users/statistics',
  requireAuth as any,
  attachUser,
  isAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [
        totalUsers,
        activeUsers,
        pendingUsers,
        inactiveUsers,
        suspendedUsers,
        investorCount,
        adminCount,
        superAdminCount,
        usersWithVerifications,
        usersWithProfiles,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
        prisma.user.count({ where: { status: UserStatus.PENDING } }),
        prisma.user.count({ where: { status: UserStatus.INACTIVE } }),
        prisma.user.count({ where: { status: UserStatus.SUSPENDED } }),
        prisma.user.count({ where: { role: UserRole.INVESTOR } }),
        prisma.user.count({ where: { role: UserRole.ADMIN } }),
        prisma.user.count({ where: { role: UserRole.SUPER_ADMIN } }),
        prisma.user.count({
          where: {
            verifications: {
              some: {},
            },
          },
        }),
        prisma.user.count({
          where: {
            profile: {
              isNot: null,
            },
          },
        }),
      ]);

      // Get recent sign-ups (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentSignups = await prisma.user.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      });

      res.json({
        success: true,
        data: {
          total: totalUsers,
          byStatus: {
            active: activeUsers,
            pending: pendingUsers,
            inactive: inactiveUsers,
            suspended: suspendedUsers,
          },
          byRole: {
            investor: investorCount,
            admin: adminCount,
            superAdmin: superAdminCount,
          },
          engagement: {
            withVerifications: usersWithVerifications,
            withProfiles: usersWithProfiles,
            recentSignups,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get all verifications with filtering
 * GET /api/admin/verifications
 */
router.get(
  '/verifications',
  requireAuth as any,
  attachUser,
  isAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, type, userId, page = 1, limit = 10 } = req.query;
      
      const where: any = {};
      if (status) where.status = status;
      if (type) where.verificationType = type;
      if (userId) where.userId = userId;
      
      const skip = (Number(page) - 1) * Number(limit);
      
      const [verifications, total] = await Promise.all([
        prisma.accreditationVerification.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { submittedAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            documents: {
              select: {
                id: true,
                documentType: true,
                fileName: true,
                uploadedAt: true,
                virusScanStatus: true,
              },
            },
          },
        }),
        prisma.accreditationVerification.count({ where }),
      ]);
      
      res.json({
        success: true,
        data: {
          verifications,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get verification statistics
 * GET /api/admin/verifications/stats
 */
router.get(
  '/verifications/stats',
  requireAuth as any,
  attachUser,
  isAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [pending, inReview, approved, rejected, expired] = await Promise.all([
        prisma.accreditationVerification.count({ where: { status: 'PENDING' } }),
        prisma.accreditationVerification.count({ where: { status: 'IN_REVIEW' } }),
        prisma.accreditationVerification.count({ where: { status: 'APPROVED' } }),
        prisma.accreditationVerification.count({ where: { status: 'REJECTED' } }),
        prisma.accreditationVerification.count({ where: { status: 'EXPIRED' } }),
      ]);
      
      res.json({
        success: true,
        data: {
          total: pending + inReview + approved + rejected + expired,
          pending,
          inReview,
          approved,
          rejected,
          expired,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get single verification details
 * GET /api/admin/verifications/:id
 */
router.get(
  '/verifications/:id',
  requireAuth as any,
  attachUser,
  isAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      const verification = await prisma.accreditationVerification.findUnique({
        where: { id },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          documents: true,
        },
      });
      
      if (!verification) {
        throw new AppError('Verification not found', 404);
      }
      
      res.json({
        success: true,
        data: verification,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Review verification (approve/reject)
 * PUT /api/admin/verifications/:id/review
 */
router.put(
  '/verifications/:id/review',
  requireAuth as any,
  attachUser,
  isAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status, notes, rejectionReason } = req.body;
      const reviewerId = req.user!.id;
      
      if (!status || !['APPROVED', 'REJECTED', 'IN_REVIEW'].includes(status)) {
        throw new AppError('Invalid status', 400);
      }
      
      if (status === 'REJECTED' && !rejectionReason) {
        throw new AppError('Rejection reason is required', 400);
      }
      
      const { VerificationService } = await import('../services/verification.service');
      
      const updated = await VerificationService.updateVerificationStatus(
        id,
        status,
        reviewerId,
        notes,
        rejectionReason
      );
      
      res.json({
        success: true,
        message: `Verification ${status.toLowerCase()} successfully`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Batch review verifications
 * POST /api/admin/verifications/batch-review
 */
router.post(
  '/verifications/batch-review',
  requireAuth as any,
  attachUser,
  isAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { verificationIds, status, notes } = req.body;
      const reviewerId = req.user!.id;
      
      if (!verificationIds || !Array.isArray(verificationIds) || verificationIds.length === 0) {
        throw new AppError('Verification IDs are required', 400);
      }
      
      if (!status || !['APPROVED', 'REJECTED', 'IN_REVIEW'].includes(status)) {
        throw new AppError('Invalid status', 400);
      }
      
      const { VerificationService } = await import('../services/verification.service');
      
      const results = await Promise.allSettled(
        verificationIds.map(id =>
          VerificationService.updateVerificationStatus(
            id,
            status,
            reviewerId,
            notes
          )
        )
      );
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      res.json({
        success: true,
        message: `${successful} verifications updated successfully${failed > 0 ? `, ${failed} failed` : ''}`,
        data: {
          successful,
          failed,
          total: verificationIds.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get verification document for review
 * GET /api/admin/verifications/:verificationId/documents/:documentId
 */
router.get(
  '/verifications/:verificationId/documents/:documentId',
  requireAuth as any,
  attachUser,
  isAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { documentId } = req.params;
      
      const { VerificationService } = await import('../services/verification.service');
      const documentBuffer = await VerificationService.getDocument(documentId);
      
      // Get document metadata for content type
      const document = await prisma.verificationDocument.findUnique({
        where: { id: documentId },
        select: { mimeType: true, fileName: true },
      });
      
      if (!document) {
        throw new AppError('Document not found', 404);
      }
      
      // Set appropriate headers
      res.setHeader('Content-Type', document.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${document.fileName}"`);
      res.send(documentBuffer);
    } catch (error) {
      next(error);
    }
  }
);

export default router;