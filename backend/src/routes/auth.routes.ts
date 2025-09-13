import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
import { emailService } from '../services/email.service';
import { AppError } from '../middleware/error.middleware';
import { z } from 'zod';

const router = Router();

// Validation schemas
const activateAccountSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(100),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const requestPasswordResetSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(100),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Check if activation token is valid
router.get('/activate/verify/:token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { activationToken: token },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        activationExpiry: true,
        isEmailVerified: true,
      },
    });
    
    if (!user) {
      throw new AppError('Invalid activation token', 400);
    }
    
    if (user.activationExpiry && user.activationExpiry < new Date()) {
      throw new AppError('Activation token has expired', 400);
    }
    
    if (user.isEmailVerified && user.status === 'ACTIVE') {
      throw new AppError('Account is already activated', 400);
    }
    
    res.json({
      success: true,
      data: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Activate account and set password
router.post('/activate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = activateAccountSchema.parse(req.body);
    
    // Find user by activation token
    const user = await prisma.user.findUnique({
      where: { activationToken: validatedData.token },
    });
    
    if (!user) {
      throw new AppError('Invalid activation token', 400);
    }
    
    if (user.activationExpiry && user.activationExpiry < new Date()) {
      throw new AppError('Activation token has expired', 400);
    }
    
    if (user.isEmailVerified && user.status === 'ACTIVE') {
      throw new AppError('Account is already activated', 400);
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        status: 'ACTIVE',
        isEmailVerified: true,
        activationToken: null,
        activationExpiry: null,
        activatedAt: new Date(),
      },
    });
    
    // Log activation
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'user.activated',
        details: { email: user.email },
      },
    });
    
    // Send success email
    await emailService.sendActivationSuccessEmail(user.email, user.firstName || '');
    
    res.json({
      success: true,
      message: 'Account activated successfully',
      data: {
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.issues[0].message, 400));
    }
    next(error);
  }
});

// Request password reset
router.post('/password/reset-request', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = requestPasswordResetSchema.parse(req.body);
    
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive password reset instructions.',
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    // Store reset token (reusing activation token field for simplicity)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        activationToken: resetToken,
        activationExpiry: resetExpiry,
      },
    });
    
    // Send reset email
    await emailService.sendPasswordResetEmail(user.email, user.firstName || '', resetToken);
    
    // Log password reset request
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'password.reset_requested',
        details: { email: user.email },
      },
    });
    
    res.json({
      success: true,
      message: 'If an account exists with this email, you will receive password reset instructions.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.issues[0].message, 400));
    }
    next(error);
  }
});

// Reset password with token
router.post('/password/reset', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = resetPasswordSchema.parse(req.body);
    
    // Find user by reset token
    const user = await prisma.user.findUnique({
      where: { activationToken: validatedData.token },
    });
    
    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }
    
    if (user.activationExpiry && user.activationExpiry < new Date()) {
      throw new AppError('Reset token has expired', 400);
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    
    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        activationToken: null,
        activationExpiry: null,
      },
    });
    
    // Log password reset
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'password.reset_completed',
        details: { email: user.email },
      },
    });
    
    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.issues[0].message, 400));
    }
    next(error);
  }
});

// Resend activation email
router.post('/activate/resend', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      throw new AppError('Email is required', 400);
    }
    
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this email and is not activated, you will receive a new activation email.',
      });
    }
    
    // Check if already activated
    if (user.isEmailVerified && user.status === 'ACTIVE') {
      return res.json({
        success: true,
        message: 'If an account exists with this email and is not activated, you will receive a new activation email.',
      });
    }
    
    // Generate new activation token
    const activationToken = crypto.randomBytes(32).toString('hex');
    const activationExpiry = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours
    
    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        activationToken,
        activationExpiry,
      },
    });
    
    // Send new invitation email
    await emailService.sendInvitationEmail(
      user.email,
      user.firstName || '',
      activationToken
    );
    
    res.json({
      success: true,
      message: 'If an account exists with this email and is not activated, you will receive a new activation email.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;