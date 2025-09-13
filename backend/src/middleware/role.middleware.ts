import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { AppError } from './error.middleware';
import { userService } from '../services/user.service';

// Extend Express Request to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        clerkUserId: string;
      };
    }
  }
}

/**
 * Middleware to fetch and attach user data to request
 * Should be used after authentication middleware
 */
export const attachUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.auth?.userId) {
      return next();
    }

    const user = await userService.getUserByClerkId(req.auth.userId);
    
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role as UserRole,
        clerkUserId: user.clerkUserId,
      };
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to require a specific role
 */
export const requireRole = (role: UserRole) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth?.userId) {
        throw new AppError('Unauthorized', 401);
      }

      // Get user if not already attached
      if (!req.user) {
        const user = await userService.getUserByClerkId(req.auth.userId);
        if (!user) {
          throw new AppError('User not found', 404);
        }
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role as UserRole,
          clerkUserId: user.clerkUserId,
        };
      }

      // Check role
      if (req.user.role !== role) {
        throw new AppError(`Access denied. ${role} role required.`, 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to require any of the specified roles
 */
export const requireAnyRole = (roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth?.userId) {
        throw new AppError('Unauthorized', 401);
      }

      // Get user if not already attached
      if (!req.user) {
        const user = await userService.getUserByClerkId(req.auth.userId);
        if (!user) {
          throw new AppError('User not found', 404);
        }
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role as UserRole,
          clerkUserId: user.clerkUserId,
        };
      }

      // Check if user has any of the required roles
      if (!roles.includes(req.user.role)) {
        throw new AppError(`Access denied. One of these roles required: ${roles.join(', ')}`, 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Helper middleware to check if user is admin
 */
export const isAdmin = requireAnyRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

/**
 * Helper middleware to check if user is super admin
 */
export const isSuperAdmin = requireRole(UserRole.SUPER_ADMIN);

/**
 * Check if user has permission (for future granular permissions)
 */
export const hasPermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth?.userId) {
        throw new AppError('Unauthorized', 401);
      }

      // Get user if not already attached
      if (!req.user) {
        const user = await userService.getUserByClerkId(req.auth.userId);
        if (!user) {
          throw new AppError('User not found', 404);
        }
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role as UserRole,
          clerkUserId: user.clerkUserId,
        };
      }

      // For now, implement basic role-based permissions
      const rolePermissions: Record<UserRole, string[]> = {
        [UserRole.INVESTOR]: [
          'verification.submit',
          'verification.view_own',
          'profile.view_own',
          'profile.update_own',
        ],
        [UserRole.ADMIN]: [
          'verification.submit',
          'verification.view_own',
          'verification.view_all',
          'verification.review',
          'verification.approve',
          'verification.reject',
          'profile.view_own',
          'profile.update_own',
          'user.view_all',
          'document.view_all',
        ],
        [UserRole.SUPER_ADMIN]: [
          '*', // All permissions
        ],
      };

      const userPermissions = rolePermissions[req.user.role] || [];
      
      // Super admin has all permissions
      if (req.user.role === UserRole.SUPER_ADMIN || userPermissions.includes('*')) {
        return next();
      }

      // Check if user has the required permission
      if (!userPermissions.includes(permission)) {
        throw new AppError(`Access denied. Permission required: ${permission}`, 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};