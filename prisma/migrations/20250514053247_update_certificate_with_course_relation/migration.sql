/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Certificate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `courseId` to the `Certificate` table without a default value. This is not possible if the table is not empty.
  - Made the column `code` on table `Certificate` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN     "courseId" TEXT NOT NULL,
ALTER COLUMN "code" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_code_key" ON "Certificate"("code");

-- CreateIndex
CREATE INDEX "Certificate_courseId_idx" ON "Certificate"("courseId");

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
