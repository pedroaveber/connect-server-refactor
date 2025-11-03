/*
  Warnings:

  - You are about to drop the column `unit_id` on the `Phone` table. All the data in the column will be lost.
  - You are about to drop the column `document` on the `units` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,company_group_id,company_id,unit_id,base_id]` on the table `user_organizations` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Phone" DROP CONSTRAINT "Phone_unit_id_fkey";

-- DropIndex
DROP INDEX "public"."units_document_key";

-- AlterTable
ALTER TABLE "Phone" DROP COLUMN "unit_id";

-- AlterTable
ALTER TABLE "units" DROP COLUMN "document";

-- CreateIndex
CREATE UNIQUE INDEX "user_organizations_user_id_company_group_id_company_id_unit_key" ON "user_organizations"("user_id", "company_group_id", "company_id", "unit_id", "base_id");
