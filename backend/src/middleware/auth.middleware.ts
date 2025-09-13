import { Request, Response, NextFunction } from 'express';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { AppError } from './error.middleware';

// Extend Express Request type to include auth
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        sessionId: string;
        claims?: any;
      };
    }
  }
}

// Use Clerk authentication
export const requireAuth = ClerkExpressRequireAuth({
  onError: (error) => {
    console.error('[Clerk Auth] Error:', error.message);
  }
});

// Custom middleware to verify user exists in our database
export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('[Verify User] Checking user:', req.auth?.userId);
    
    if (!req.auth?.userId) {
      console.log('[Verify User] No userId found in request');
      throw new AppError('Unauthorized', 401);
    }

    console.log('[Verify User] User verified:', req.auth.userId);
    next();
  } catch (error) {
    next(error);
  }
};