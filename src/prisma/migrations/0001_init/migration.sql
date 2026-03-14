-- CreateEnum
CREATE TYPE "SocialPostStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SCHEDULED', 'PUBLISHING', 'PUBLISHED', 'PARTIAL', 'FAILED');

-- CreateTable
CREATE TABLE "AyrshareProfile" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "profileKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AyrshareProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialPost" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "mediaUrl" TEXT NOT NULL,
    "status" "SocialPostStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialPostPlatform" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "hashtags" TEXT[],
    "externalPostId" TEXT,
    "externalPostUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,

    CONSTRAINT "SocialPostPlatform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostApproval" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedBy" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectionNotes" TEXT,

    CONSTRAINT "PostApproval_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AyrshareProfile_companyId_key" ON "AyrshareProfile"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "AyrshareProfile_profileKey_key" ON "AyrshareProfile"("profileKey");

-- CreateIndex
CREATE UNIQUE INDEX "PostApproval_postId_key" ON "PostApproval"("postId");

-- AddForeignKey
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "AyrshareProfile"("companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPostPlatform" ADD CONSTRAINT "SocialPostPlatform_postId_fkey" FOREIGN KEY ("postId") REFERENCES "SocialPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostApproval" ADD CONSTRAINT "PostApproval_postId_fkey" FOREIGN KEY ("postId") REFERENCES "SocialPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
