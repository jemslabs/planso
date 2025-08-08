/*
  Warnings:

  - The values [DRAFT,IN_REVIEW] on the enum `PostStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."PostStatus_new" AS ENUM ('PENDING', 'APPROVED', 'SCHEDULED', 'POSTED', 'REJECTED');
ALTER TABLE "public"."Post" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Post" ALTER COLUMN "status" TYPE "public"."PostStatus_new" USING ("status"::text::"public"."PostStatus_new");
ALTER TYPE "public"."PostStatus" RENAME TO "PostStatus_old";
ALTER TYPE "public"."PostStatus_new" RENAME TO "PostStatus";
DROP TYPE "public"."PostStatus_old";
ALTER TABLE "public"."Post" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Post" ADD COLUMN     "approvedById" INTEGER,
ADD COLUMN     "rejectedById" INTEGER,
ADD COLUMN     "scheduledById" INTEGER,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "public"."Feedback" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "postId" INTEGER NOT NULL,
    "feedback" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_memberId_postId_key" ON "public"."Feedback"("memberId", "postId");

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "public"."Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_rejectedById_fkey" FOREIGN KEY ("rejectedById") REFERENCES "public"."Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_scheduledById_fkey" FOREIGN KEY ("scheduledById") REFERENCES "public"."Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Feedback" ADD CONSTRAINT "Feedback_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "public"."Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Feedback" ADD CONSTRAINT "Feedback_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
