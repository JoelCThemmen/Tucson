import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { requireAuth, verifyUser } from '../middleware/auth.middleware';
import { isAdmin, attachUser } from '../middleware/role.middleware';
import { VerificationService } from '../services/verification.service';
import { userService } from '../services/user.service';
import { AppError } from '../middleware/error.middleware';
import { VerificationType, DocumentType } from '@prisma/client';
import rateLimit from 'express-rate-limit';

const router = Router();

// Configure multer for file uploads (store in memory temporarily)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5, // Max 5 files per request
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed'));
    }
  },
});

// Rate limiting for document uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: 'Too many document uploads. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for verification submissions
const submissionLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // 3 submissions per day
  message: 'Too many verification submissions. Please try again tomorrow.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Submit a new verification request
 * POST /api/verification/submit
 */
router.post(
  '/submit',
  requireAuth as any,
  verifyUser,
  submissionLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clerkUserId = req.auth!.userId;
      
      // Get the actual database user
      const user = await userService.getUserByClerkId(clerkUserId);
      
      if (!user) {
        throw new AppError('User not found', 404);
      }
      
      const userId = user.id;
      const {
        verificationType,
        annualIncome,
        incomeSource,
        netWorth,
        liquidNetWorth,
        attestation,
        consentToVerify,
      } = req.body;

      // Validate required fields
      if (!verificationType || !attestation || !consentToVerify) {
        throw new AppError('Missing required fields', 400);
      }

      if (!Object.values(VerificationType).includes(verificationType)) {
        throw new AppError('Invalid verification type', 400);
      }

      // Validate type-specific fields
      if (verificationType === VerificationType.INCOME) {
        if (!annualIncome || !incomeSource) {
          throw new AppError('Annual income and income source are required for income verification', 400);
        }
      } else if (verificationType === VerificationType.NET_WORTH) {
        if (!netWorth) {
          throw new AppError('Net worth is required for net worth verification', 400);
        }
      }

      const verification = await VerificationService.createVerification({
        userId,
        verificationType,
        annualIncome: annualIncome ? parseFloat(annualIncome) : undefined,
        incomeSource,
        netWorth: netWorth ? parseFloat(netWorth) : undefined,
        liquidNetWorth: liquidNetWorth ? parseFloat(liquidNetWorth) : undefined,
        attestation: Boolean(attestation),
        consentToVerify: Boolean(consentToVerify),
      });

      res.status(201).json({
        success: true,
        message: 'Verification request submitted successfully',
        data: {
          id: verification.id,
          status: verification.status,
          verificationType: verification.verificationType,
          submittedAt: verification.submittedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Upload documents for verification
 * POST /api/verification/:verificationId/documents
 */
router.post(
  '/:verificationId/documents',
  requireAuth as any,
  verifyUser,
  uploadLimiter,
  upload.array('documents', 5),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { verificationId } = req.params;
      const { documentTypes } = req.body;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        throw new AppError('No files uploaded', 400);
      }

      // Parse document types
      const types = documentTypes ? JSON.parse(documentTypes) : [];
      if (types.length !== files.length) {
        throw new AppError('Document types must be specified for each file', 400);
      }

      // Validate document types
      for (const type of types) {
        if (!Object.values(DocumentType).includes(type)) {
          throw new AppError(`Invalid document type: ${type}`, 400);
        }
      }

      const uploadedDocuments = [];

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const documentType = types[i];

        const document = await VerificationService.uploadDocument({
          verificationId,
          documentType,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          fileBuffer: file.buffer,
        });

        uploadedDocuments.push(document);
      }

      res.status(201).json({
        success: true,
        message: `${uploadedDocuments.length} document(s) uploaded successfully`,
        data: uploadedDocuments,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get verification status for current user
 * GET /api/verification/status
 */
router.get(
  '/status',
  requireAuth as any,
  verifyUser,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clerkUserId = req.auth!.userId;
      
      // Get the actual database user
      const user = await userService.getUserByClerkId(clerkUserId);
      
      if (!user) {
        throw new AppError('User not found', 404);
      }
      
      const userId = user.id;
      const status = await VerificationService.getVerificationStatus(userId);

      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get verification details by ID
 * GET /api/verification/:verificationId
 */
router.get(
  '/:verificationId',
  requireAuth as any,
  verifyUser,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { verificationId } = req.params;
      const clerkUserId = req.auth!.userId;
      
      // Get the actual database user
      const user = await userService.getUserByClerkId(clerkUserId);
      
      if (!user) {
        throw new AppError('User not found', 404);
      }
      
      const userId = user.id;

      // Get verification and ensure it belongs to the user
      const status = await VerificationService.getVerificationStatus(userId);
      const verification = status.verificationHistory.find((v) => v.id === verificationId);

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
 * Cancel a pending verification request
 * DELETE /api/verification/:verificationId
 */
router.delete(
  '/:verificationId',
  requireAuth as any,
  verifyUser,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { verificationId } = req.params;
      const clerkUserId = req.auth!.userId;
      
      // Get the actual database user
      const user = await userService.getUserByClerkId(clerkUserId);
      
      if (!user) {
        throw new AppError('User not found', 404);
      }
      
      const userId = user.id;

      // Get verification and ensure it belongs to the user and is pending
      const status = await VerificationService.getVerificationStatus(userId);
      const verification = status.verificationHistory.find((v) => v.id === verificationId);

      if (!verification) {
        throw new AppError('Verification not found', 404);
      }

      if (verification.status !== 'PENDING') {
        throw new AppError('Only pending verifications can be cancelled', 400);
      }

      // Update status to cancelled (would need to add CANCELLED to enum)
      // For now, we'll just reject it with a reason
      await VerificationService.updateVerificationStatus(
        verificationId,
        'REJECTED' as any, // Would be CANCELLED in production
        userId, // User cancelling their own request
        'Cancelled by user',
        'User cancelled verification request'
      );

      res.json({
        success: true,
        message: 'Verification request cancelled successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Admin endpoint: Review verification request
 * PUT /api/verification/:verificationId/review
 * Requires ADMIN or SUPER_ADMIN role
 */
router.put(
  '/:verificationId/review',
  requireAuth as any,
  attachUser,
  isAdmin, // Check for admin role
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { verificationId } = req.params;
      const { status, notes, rejectionReason } = req.body;
      const reviewerId = req.user!.id; // Use actual user ID from database

      if (!status || !['APPROVED', 'REJECTED', 'IN_REVIEW'].includes(status)) {
        throw new AppError('Invalid status', 400);
      }

      if (status === 'REJECTED' && !rejectionReason) {
        throw new AppError('Rejection reason is required', 400);
      }

      const updated = await VerificationService.updateVerificationStatus(
        verificationId,
        status as any,
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
 * Admin endpoint: Get document for review
 * GET /api/verification/document/:documentId
 * Requires ADMIN or SUPER_ADMIN role
 */
router.get(
  '/document/:documentId',
  requireAuth as any,
  attachUser,
  isAdmin, // Check for admin role
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { documentId } = req.params;

      const documentBuffer = await VerificationService.getDocument(documentId);

      // Set appropriate headers for file download
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', 'attachment; filename="document.pdf"');
      res.send(documentBuffer);
    } catch (error) {
      next(error);
    }
  }
);

export default router;