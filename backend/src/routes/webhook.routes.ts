import { Router, Request, Response, NextFunction } from 'express';
import { Webhook } from 'svix';
import { userService } from '../services/user.service';
import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';
import { UserRole, UserStatus } from '@prisma/client';

const router = Router();

interface ClerkWebhookEvent {
  data: any;
  object: string;
  type: string;
}

interface ClerkInvitationData {
  id: string;
  email_address: string;
  public_metadata?: {
    role?: UserRole;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    gender?: string;
    ethnicity?: string;
    occupation?: string;
    investmentExperience?: string;
    riskTolerance?: string;
    investmentGoals?: string;
    expectedInvestmentAmount?: number;
    accreditedInvestor?: boolean;
    sourceOfFunds?: string;
  };
  status: string;
  created_at: number;
  updated_at: number;
}

interface ClerkUserData {
  id: string;
  email_addresses: Array<{
    email_address: string;
    id: string;
  }>;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  created_at: number;
  updated_at: number;
  public_metadata?: any;
}

// Clerk webhook handler
router.post('/clerk', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    
    if (!WEBHOOK_SECRET) {
      console.warn('⚠️ CLERK_WEBHOOK_SECRET not configured, skipping webhook verification');
      // In development, we might want to skip verification
      if (process.env.NODE_ENV === 'production') {
        throw new AppError('Webhook secret not configured', 500);
      }
    }

    // Get headers
    const svixId = req.headers['svix-id'] as string;
    const svixTimestamp = req.headers['svix-timestamp'] as string;
    const svixSignature = req.headers['svix-signature'] as string;

    // Verify webhook if secret is configured
    let payload: ClerkWebhookEvent;
    
    if (WEBHOOK_SECRET && svixId && svixTimestamp && svixSignature) {
      const wh = new Webhook(WEBHOOK_SECRET);
      try {
        payload = wh.verify(JSON.stringify(req.body), {
          'svix-id': svixId,
          'svix-timestamp': svixTimestamp,
          'svix-signature': svixSignature,
        }) as ClerkWebhookEvent;
      } catch (err) {
        console.error('❌ Webhook verification failed:', err);
        throw new AppError('Invalid webhook signature', 400);
      }
    } else {
      // In development without verification
      payload = req.body as ClerkWebhookEvent;
    }

    const { type, data } = payload;
    console.log(`📨 Received Clerk webhook: ${type}`);

    switch (type) {
      case 'user.created':
        await handleUserCreated(data as ClerkUserData);
        break;
      
      case 'user.updated':
        await handleUserUpdated(data as ClerkUserData);
        break;
      
      case 'user.deleted':
        await handleUserDeleted(data);
        break;

      case 'invitation.created':
        await handleInvitationCreated(data as ClerkInvitationData);
        break;

      case 'invitation.accepted':
        await handleInvitationAccepted(data as ClerkInvitationData);
        break;

      case 'invitation.revoked':
        await handleInvitationRevoked(data as ClerkInvitationData);
        break;

      default:
        console.log(`ℹ️ Unhandled webhook type: ${type}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    next(error);
  }
});

// Handler functions
async function handleUserCreated(data: ClerkUserData) {
  try {
    const email = data.email_addresses[0]?.email_address;
    
    if (!email) {
      console.error('No email found in user data');
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { clerkUserId: data.id }
    });

    if (existingUser) {
      console.log(`User already exists: ${data.id}`);
      return;
    }

    // Extract metadata from public_metadata (set during invitation)
    const metadata = data.public_metadata || {};
    
    // Create user with profile
    const user = await prisma.user.create({
      data: {
        clerkUserId: data.id,
        email,
        firstName: metadata.firstName || data.first_name,
        lastName: metadata.lastName || data.last_name,
        role: metadata.role || UserRole.INVESTOR,
        status: UserStatus.ACTIVE,
        isEmailVerified: true, // Clerk handles email verification
        activatedAt: new Date(),
        profile: {
          create: {
            phone: metadata.phoneNumber,
            location: metadata.city && metadata.state ? `${metadata.city}, ${metadata.state}` : undefined,
            company: metadata.occupation,
            preferences: metadata ? {
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
            } : undefined,
            investmentPreferences: metadata.investmentGoals,
            riskTolerance: metadata.riskTolerance,
          }
        }
      },
      include: {
        profile: true
      }
    });

    console.log(`✅ User created from webhook: ${user.id}`);
    
    // Log the creation
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'user.created_from_clerk',
        details: { clerkUserId: data.id, email }
      }
    });
  } catch (error) {
    console.error('Error handling user.created webhook:', error);
    throw error;
  }
}

async function handleUserUpdated(data: ClerkUserData) {
  try {
    await userService.updateUserFromClerk(data);
  } catch (error) {
    console.error('Error handling user.updated webhook:', error);
    throw error;
  }
}

async function handleUserDeleted(data: any) {
  try {
    if (data.id) {
      await userService.deleteUserFromClerk(data.id);
    }
  } catch (error) {
    console.error('Error handling user.deleted webhook:', error);
    throw error;
  }
}

async function handleInvitationCreated(data: ClerkInvitationData) {
  try {
    console.log(`📬 Invitation created for: ${data.email_address}`);
    
    // We could track pending invitations in the database if needed
    // For now, just log it
    const metadata = data.public_metadata || {};
    console.log('Invitation metadata:', metadata);
  } catch (error) {
    console.error('Error handling invitation.created webhook:', error);
    throw error;
  }
}

async function handleInvitationAccepted(data: ClerkInvitationData) {
  try {
    console.log(`✅ Invitation accepted by: ${data.email_address}`);
    
    // The user.created webhook will handle creating the user record
    // This is just for logging/tracking purposes
  } catch (error) {
    console.error('Error handling invitation.accepted webhook:', error);
    throw error;
  }
}

async function handleInvitationRevoked(data: ClerkInvitationData) {
  try {
    console.log(`🚫 Invitation revoked for: ${data.email_address}`);
    
    // Clean up any pending records if needed
  } catch (error) {
    console.error('Error handling invitation.revoked webhook:', error);
    throw error;
  }
}

export default router;