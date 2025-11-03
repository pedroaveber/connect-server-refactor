-- DropForeignKey
ALTER TABLE "public"."user_organizations" DROP CONSTRAINT "user_organizations_company_group_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_organizations" DROP CONSTRAINT "user_organizations_company_id_fkey";

-- AlterTable
ALTER TABLE "user_organizations" ALTER COLUMN "company_group_id" DROP NOT NULL,
ALTER COLUMN "company_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "user_organizations" ADD CONSTRAINT "user_organizations_company_group_id_fkey" FOREIGN KEY ("company_group_id") REFERENCES "company_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_organizations" ADD CONSTRAINT "user_organizations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
