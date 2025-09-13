import { PrismaClient, VerificationType, VerificationStatus, DocumentType, ScanStatus } from '@prisma/client';
import crypto from 'crypto';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

// Encryption key for documents (stored in database)
const ENCRYPTION_KEY = process.env.DOCUMENT_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

interface VerificationSubmission {
  userId: string;
  verificationType: VerificationType;
  annualIncome?: number;
  incomeSource?: string;
  netWorth?: number;
  liquidNetWorth?: number;
  attestation: boolean;
  consentToVerify: boolean;
}

interface DocumentUpload {
  verificationId: string;
  documentType: DocumentType;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileBuffer: Buffer;
}

export class VerificationService {
  // SEC Rule 501 thresholds for accredited investors
  private static readonly INCOME_THRESHOLD_SINGLE = 200000; // $200k for single
  private static readonly INCOME_THRESHOLD_JOINT = 300000; // $300k for joint
  private static readonly NET_WORTH_THRESHOLD = 1000000; // $1M net worth

  /**
   * Create a new verification submission
   */
  static async createVerification(data: VerificationSubmission) {
    // Validate thresholds based on verification type
    if (data.verificationType === VerificationType.INCOME) {
      if (!data.annualIncome || data.annualIncome < this.INCOME_THRESHOLD_SINGLE) {
        throw new AppError(
          `Annual income must be at least $${this.INCOME_THRESHOLD_SINGLE.toLocaleString()} for accredited investor status`,
          400
        );
      }
    } else if (data.verificationType === VerificationType.NET_WORTH) {
      if (!data.netWorth || data.netWorth < this.NET_WORTH_THRESHOLD) {
        throw new AppError(
          `Net worth must be at least $${this.NET_WORTH_THRESHOLD.toLocaleString()} for accredited investor status`,
          400
        );
      }
    }

    // Check for existing pending verification
    const existingVerification = await prisma.accreditationVerification.findFirst({
      where: {
        userId: data.userId,
        status: {
          in: [VerificationStatus.PENDING, VerificationStatus.IN_REVIEW],
        },
      },
    });

    if (existingVerification) {
      throw new AppError('You already have a verification request in progress', 400);
    }

    // Create verification record
    const verification = await prisma.accreditationVerification.create({
      data: {
        userId: data.userId,
        verificationType: data.verificationType,
        annualIncome: data.annualIncome,
        incomeSource: data.incomeSource,
        netWorth: data.netWorth,
        liquidNetWorth: data.liquidNetWorth,
        attestation: data.attestation,
        consentToVerify: data.consentToVerify,
        status: VerificationStatus.PENDING,
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Log the submission
    await this.createAuditLog(data.userId, 'verification.submitted', {
      verificationId: verification.id,
      type: data.verificationType,
    });

    return verification;
  }

  /**
   * Upload and encrypt a document
   */
  static async uploadDocument(data: DocumentUpload): Promise<any> {
    const verification = await prisma.accreditationVerification.findUnique({
      where: { id: data.verificationId },
    });

    if (!verification) {
      throw new AppError('Verification request not found', 404);
    }

    if (verification.status !== VerificationStatus.PENDING) {
      throw new AppError('Cannot upload documents to a processed verification', 400);
    }

    // Validate file type
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
    ];

    if (!allowedMimeTypes.includes(data.mimeType)) {
      throw new AppError('Invalid file type. Only PDF, JPG, and PNG files are allowed', 400);
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (data.fileSize > maxSize) {
      throw new AppError('File size exceeds 10MB limit', 400);
    }

    // Generate encryption key and IV
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');
    
    // Encrypt the document
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encryptedBuffer = Buffer.concat([
      cipher.update(data.fileBuffer),
      cipher.final(),
    ]);

    // Calculate checksum for integrity
    const checksum = crypto
      .createHash('sha256')
      .update(data.fileBuffer)
      .digest('hex');

    // Save document with encrypted data directly to database
    const document = await prisma.verificationDocument.create({
      data: {
        verificationId: data.verificationId,
        documentType: data.documentType,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        fileData: encryptedBuffer,
        encryptionIV: iv.toString('hex'),
        checksum: checksum,
        virusScanStatus: ScanStatus.PENDING,
        scheduledDeletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Queue virus scanning (in production, this would be async)
    await this.scanDocument(document.id);

    // Log the upload
    await this.createAuditLog(verification.userId, 'document.uploaded', {
      documentId: document.id,
      documentType: data.documentType,
      fileName: data.fileName,
    });

    return {
      id: document.id,
      fileName: document.fileName,
      documentType: document.documentType,
      uploadedAt: document.uploadedAt,
    };
  }

  /**
   * Get verification status for a user
   */
  static async getVerificationStatus(userId: string) {
    const verifications = await prisma.accreditationVerification.findMany({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
      include: {
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
    });

    // Check if user has active verification
    const activeVerification = verifications.find(
      (v) => v.status === VerificationStatus.APPROVED && 
             (!v.expiresAt || v.expiresAt > new Date())
    );

    return {
      isAccredited: !!activeVerification,
      currentVerification: verifications[0] || null,
      verificationHistory: verifications,
    };
  }

  /**
   * Update verification status (admin only)
   */
  static async updateVerificationStatus(
    verificationId: string,
    status: VerificationStatus,
    reviewerId: string,
    notes?: string,
    rejectionReason?: string
  ) {
    const verification = await prisma.accreditationVerification.findUnique({
      where: { id: verificationId },
      include: { user: true },
    });

    if (!verification) {
      throw new AppError('Verification not found', 404);
    }

    // Calculate expiration date if approved (1 year)
    const expiresAt = status === VerificationStatus.APPROVED
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      : undefined;

    const updated = await prisma.accreditationVerification.update({
      where: { id: verificationId },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedBy: reviewerId,
        reviewerNotes: notes,
        rejectionReason: rejectionReason,
        expiresAt,
      },
    });

    // Log the status change
    await this.createAuditLog(verification.userId, 'verification.status_changed', {
      verificationId,
      oldStatus: verification.status,
      newStatus: status,
      reviewerId,
    });

    // Send notification email (implement email service)
    await this.sendVerificationStatusEmail(verification.user.email, status, rejectionReason);

    return updated;
  }

  /**
   * Decrypt and retrieve a document (admin only)
   */
  static async getDocument(documentId: string): Promise<Buffer> {
    const document = await prisma.verificationDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    if (!document.fileData) {
      throw new AppError('Document data not found', 404);
    }

    try {
      // Decrypt the document
      const key = Buffer.from(ENCRYPTION_KEY, 'hex');
      const iv = Buffer.from(document.encryptionIV, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      
      const decryptedBuffer = Buffer.concat([
        decipher.update(document.fileData),
        decipher.final(),
      ]);

      // Verify checksum
      const checksum = crypto
        .createHash('sha256')
        .update(decryptedBuffer)
        .digest('hex');

      if (checksum !== document.checksum) {
        throw new AppError('Document integrity check failed', 500);
      }

      return decryptedBuffer;
    } catch (error) {
      console.error('Error decrypting document:', error);
      throw new AppError('Failed to retrieve document', 500);
    }
  }

  /**
   * Delete expired documents
   */
  static async cleanupExpiredDocuments() {
    const expiredDocs = await prisma.verificationDocument.findMany({
      where: {
        scheduledDeletion: {
          lte: new Date(),
        },
        deletedAt: null,
      },
    });

    for (const doc of expiredDocs) {
      try {
        // Mark as deleted in database (soft delete)
        // The actual file data will be removed by setting fileData to null
        await prisma.verificationDocument.update({
          where: { id: doc.id },
          data: { 
            deletedAt: new Date(),
            fileData: null, // Remove the actual file data
          },
        });
      } catch (error) {
        console.error(`Failed to delete document ${doc.id}:`, error);
      }
    }

    return expiredDocs.length;
  }

  /**
   * Simulate virus scanning (in production, use real antivirus API)
   */
  private static async scanDocument(documentId: string) {
    // In production, integrate with ClamAV or VirusTotal API
    // For now, simulate a scan that marks documents as clean
    
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate scan time

    await prisma.verificationDocument.update({
      where: { id: documentId },
      data: {
        virusScanStatus: ScanStatus.CLEAN,
        virusScanDate: new Date(),
        virusScanResult: 'No threats detected',
      },
    });
  }

  /**
   * Send verification status email
   */
  private static async sendVerificationStatusEmail(
    email: string,
    status: VerificationStatus,
    rejectionReason?: string
  ) {
    // In production, use SendGrid or similar service
    // For now, just log the email
    console.log(`Email notification: ${email} - Verification ${status}`);
    if (rejectionReason) {
      console.log(`Rejection reason: ${rejectionReason}`);
    }
  }

  /**
   * Create audit log entry
   */
  private static async createAuditLog(userId: string, action: string, details: any) {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details,
      },
    });
  }
}