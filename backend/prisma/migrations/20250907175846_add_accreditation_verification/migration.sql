-- CreateEnum
CREATE TYPE "public"."VerificationType" AS ENUM ('INCOME', 'NET_WORTH');

-- CreateEnum
CREATE TYPE "public"."VerificationStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED', 'RESUBMISSION_REQUIRED');

-- CreateEnum
CREATE TYPE "public"."DocumentType" AS ENUM ('W2', 'TAX_RETURN', 'PAY_STUB', 'BANK_STATEMENT', 'INVESTMENT_STATEMENT', 'CPA_LETTER', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ScanStatus" AS ENUM ('PENDING', 'CLEAN', 'INFECTED', 'ERROR');

-- CreateTable
CREATE TABLE "public"."AccreditationVerification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "verificationType" "public"."VerificationType" NOT NULL,
    "status" "public"."VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "annualIncome" DOUBLE PRECISION,
    "incomeSource" TEXT,
    "netWorth" DOUBLE PRECISION,
    "liquidNetWorth" DOUBLE PRECISION,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewerNotes" TEXT,
    "rejectionReason" TEXT,
    "attestation" BOOLEAN NOT NULL DEFAULT false,
    "consentToVerify" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccreditationVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VerificationDocument" (
    "id" TEXT NOT NULL,
    "verificationId" TEXT NOT NULL,
    "documentType" "public"."DocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "encryptedS3Key" TEXT NOT NULL,
    "encryptionIV" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,
    "virusScanStatus" "public"."ScanStatus" NOT NULL DEFAULT 'PENDING',
    "virusScanDate" TIMESTAMP(3),
    "virusScanResult" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "scheduledDeletion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccreditationVerification_userId_status_idx" ON "public"."AccreditationVerification"("userId", "status");

-- CreateIndex
CREATE INDEX "AccreditationVerification_status_submittedAt_idx" ON "public"."AccreditationVerification"("status", "submittedAt");

-- CreateIndex
CREATE INDEX "VerificationDocument_verificationId_idx" ON "public"."VerificationDocument"("verificationId");

-- AddForeignKey
ALTER TABLE "public"."AccreditationVerification" ADD CONSTRAINT "AccreditationVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VerificationDocument" ADD CONSTRAINT "VerificationDocument_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES "public"."AccreditationVerification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
