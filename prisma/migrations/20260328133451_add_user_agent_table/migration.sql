/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user',
ADD COLUMN     "verificationFollowers" INTEGER,
ADD COLUMN     "verificationPlatform" TEXT,
ADD COLUMN     "verificationProofUrl" TEXT,
ADD COLUMN     "verificationStatus" TEXT NOT NULL DEFAULT 'unverified',
ADD COLUMN     "verificationSubmitTime" TIMESTAMP(3),
ADD COLUMN     "verificationUsername" TEXT,
ALTER COLUMN "email" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatorAuth" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "fansCount" INTEGER NOT NULL,
    "proofUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rejectReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "auditTime" TIMESTAMP(3),
    "auditorId" TEXT,

    CONSTRAINT "CreatorAuth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatorUser" (
    "userId" TEXT NOT NULL,
    "isCreator" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreatorUser_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- CreateIndex
CREATE INDEX "CreatorAuth_userId_idx" ON "CreatorAuth"("userId");

-- CreateIndex
CREATE INDEX "CreatorAuth_status_idx" ON "CreatorAuth"("status");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
