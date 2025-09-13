import { prisma } from '../index';
import { User, UserProfile } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

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
}

class UserService {
  // Create user from Clerk webhook
  async createUserFromClerk(clerkData: ClerkUserData): Promise<User> {
    try {
      const email = clerkData.email_addresses[0]?.email_address;
      
      if (!email) {
        throw new AppError('No email found in Clerk data', 400);
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { clerkUserId: clerkData.id }
      });

      if (existingUser) {
        console.log(`User already exists: ${clerkData.id}`);
        return existingUser;
      }

      // Create user with profile
      const user = await prisma.user.create({
        data: {
          clerkUserId: clerkData.id,
          email,
          firstName: clerkData.first_name,
          lastName: clerkData.last_name,
          profile: {
            create: {} // Create empty profile
          }
        },
        include: {
          profile: true
        }
      });

      console.log(`User created from Clerk: ${user.id}`);
      return user;
    } catch (error) {
      console.error('Error creating user from Clerk:', error);
      throw error;
    }
  }

  // Update user from Clerk webhook
  async updateUserFromClerk(clerkData: ClerkUserData): Promise<User | null> {
    try {
      const email = clerkData.email_addresses[0]?.email_address;
      
      if (!email) {
        throw new AppError('No email found in Clerk data', 400);
      }

      const user = await prisma.user.update({
        where: { clerkUserId: clerkData.id },
        data: {
          email,
          firstName: clerkData.first_name,
          lastName: clerkData.last_name,
        }
      });

      console.log(`User updated from Clerk: ${user.id}`);
      return user;
    } catch (error) {
      console.error('Error updating user from Clerk:', error);
      // If user doesn't exist, create them
      if ((error as any).code === 'P2025') {
        return this.createUserFromClerk(clerkData);
      }
      throw error;
    }
  }

  // Delete user from Clerk webhook
  async deleteUserFromClerk(clerkUserId: string): Promise<void> {
    try {
      await prisma.user.delete({
        where: { clerkUserId }
      });
      console.log(`User deleted from Clerk: ${clerkUserId}`);
    } catch (error) {
      console.error('Error deleting user from Clerk:', error);
      // Ignore if user doesn't exist
      if ((error as any).code !== 'P2025') {
        throw error;
      }
    }
  }

  // Get user by Clerk ID
  async getUserByClerkId(clerkUserId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { clerkUserId },
      include: { profile: true }
    });
  }

  // Get or create user (for ensuring user exists)
  async getOrCreateUser(clerkUserId: string, email: string, firstName?: string, lastName?: string): Promise<User> {
    let user = await this.getUserByClerkId(clerkUserId);
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkUserId,
          email,
          firstName,
          lastName,
          profile: {
            create: {}
          }
        },
        include: {
          profile: true
        }
      });
    }
    
    return user;
  }

  // Update user profile
  async updateUserProfile(clerkUserId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    // First ensure user exists
    const user = await this.getUserByClerkId(clerkUserId);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Remove fields that shouldn't be updated directly
    const { id, userId, createdAt, updatedAt, ...updateData } = profileData as any;

    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: updateData,
      create: {
        userId: user.id,
        ...updateData
      }
    });

    // Log audit
    await this.createAuditLog(user.id, 'profile.update', {
      fields: Object.keys(updateData)
    });

    return profile;
  }

  // Get user profile
  async getUserProfile(clerkUserId: string): Promise<UserProfile | null> {
    const user = await this.getUserByClerkId(clerkUserId);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return prisma.userProfile.findUnique({
      where: { userId: user.id }
    });
  }

  // Create audit log
  private async createAuditLog(userId: string, action: string, details?: any, ipAddress?: string, userAgent?: string) {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details,
        ipAddress,
        userAgent
      }
    });
  }
}

export const userService = new UserService();