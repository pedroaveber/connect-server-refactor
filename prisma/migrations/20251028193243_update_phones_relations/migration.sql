-- DropForeignKey
ALTER TABLE "public"."Phone" DROP CONSTRAINT "Phone_company_group_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Phone" DROP CONSTRAINT "Phone_company_id_fkey";

-- AlterTable
ALTER TABLE "Phone" ALTER COLUMN "company_group_id" DROP NOT NULL,
ALTER COLUMN "company_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Phone" ADD CONSTRAINT "Phone_company_group_id_fkey" FOREIGN KEY ("company_group_id") REFERENCES "company_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phone" ADD CONSTRAINT "Phone_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
