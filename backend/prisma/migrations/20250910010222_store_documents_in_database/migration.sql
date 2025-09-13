/*
  Warnings:

  - You are about to drop the column `encryptedS3Key` on the `VerificationDocument` table. All the data in the column will be lost.
  - Added the required column `fileData` to the `VerificationDocument` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."VerificationDocument" DROP COLUMN "encryptedS3Key",
ADD COLUMN     "fileData" BYTEA NOT NULL;
