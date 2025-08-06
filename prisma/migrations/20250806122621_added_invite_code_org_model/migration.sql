/*
  Warnings:

  - A unique constraint covering the columns `[inviteCode]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `inviteCode` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Organization" ADD COLUMN     "inviteCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Organization_inviteCode_key" ON "public"."Organization"("inviteCode");
