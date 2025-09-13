import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth, verifyUser } from '../middleware/auth.middleware';
import { userService } from '../services/user.service';
import { AppError } from '../middleware/error.middleware';

const router = Router();

// Debug middleware to log headers
router.use((req, res, next) => {
  console.log('Request headers:', {
    authorization: req.headers.authorization,
    cookie: req.headers.cookie
  });
  next();
});

// All routes require authentication
router.use(requireAuth as any);
router.use(verifyUser);

// Get current user profile
router.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkUserId = req.auth!.userId;
    
    // Get user by Clerk ID (works for both mock auth and real Clerk)
    const user = await userService.getUserByClerkId(clerkUserId);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        profile: (user as any).profile
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkUserId = req.auth!.userId;
    const profileData = req.body;

    // Validate input
    const allowedFields = [
      'bio', 'avatarUrl', 'phone', 'location', 
      'company', 'position', 'website', 'linkedIn', 
      'aboutMe', 'investmentPreferences', 'riskTolerance', 'preferences'
    ];
    
    const updateData: any = {};
    for (const field of allowedFields) {
      if (field in profileData) {
        updateData[field] = profileData[field];
      }
    }

    const profile = await userService.updateUserProfile(clerkUserId, updateData);

    res.json({
      status: 'success',
      data: { profile }
    });
  } catch (error) {
    next(error);
  }
});

// Upload avatar
router.post('/avatar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // This is a placeholder - in production, you'd handle file upload
    // using multer or similar, upload to S3/Cloudinary, and return the URL
    const clerkUserId = req.auth!.userId;
    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      throw new AppError('Avatar URL is required', 400);
    }

    const profile = await userService.updateUserProfile(clerkUserId, { avatarUrl });

    res.json({
      status: 'success',
      data: { avatarUrl: profile.avatarUrl }
    });
  } catch (error) {
    next(error);
  }
});

// Get user preferences
router.get('/preferences', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkUserId = req.auth!.userId;
    
    const profile = await userService.getUserProfile(clerkUserId);
    
    res.json({
      status: 'success',
      data: { preferences: profile?.preferences || {} }
    });
  } catch (error) {
    next(error);
  }
});

// Update user preferences
router.put('/preferences', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkUserId = req.auth!.userId;
    const preferences = req.body;

    const profile = await userService.updateUserProfile(clerkUserId, { preferences });

    res.json({
      status: 'success',
      data: { preferences: profile.preferences }
    });
  } catch (error) {
    next(error);
  }
});

export default router;