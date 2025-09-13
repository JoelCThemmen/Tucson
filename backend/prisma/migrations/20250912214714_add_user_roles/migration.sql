-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('INVESTOR', 'ADMIN', 'SUPER_ADMIN');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "role" "public"."UserRole" NOT NULL DEFAULT 'INVESTOR';
