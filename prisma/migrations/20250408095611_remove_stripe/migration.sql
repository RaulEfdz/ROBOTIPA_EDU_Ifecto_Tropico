/*
  Warnings:

  - You are about to drop the `StripeCustomer` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `paymentMethod` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "StripeCustomer" DROP CONSTRAINT "StripeCustomer_userId_fkey";

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "paymentMethod" TEXT NOT NULL;

-- DropTable
DROP TABLE "StripeCustomer";
