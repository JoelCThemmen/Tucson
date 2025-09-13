import { Request, Response, NextFunction } from 'express';

/**
 * Development authentication middleware that accepts mock tokens
 * Only used when CLERK_SECRET_KEY is not set
 */
export const devAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  // Accept any Bearer token in development
  // Use the existing Joel Themmen user's Clerk ID from the database
  if (authHeader?.startsWith('Bearer ')) {
    req.auth = {
      userId: 'user_32LmOoXP3UT4hR02Qkh2Q7EKdb7',  // Existing Joel Themmen's Clerk ID
      sessionId: 'dev-session-123',
      claims: {
        email: 'joel.themmen@gmail.com',
        firstName: 'Joel',
        lastName: 'Themmen'
      }
    };
    next();
  } else {
    res.status(401).json({
      status: 'error',
      message: 'Unauthenticated'
    });
  }
};