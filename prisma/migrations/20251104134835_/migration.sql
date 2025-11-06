-- AlterTable
ALTER TABLE "users" ADD COLUMN     "associated_company_group_id" TEXT;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_associated_company_group_id_fkey" FOREIGN KEY ("associated_company_group_id") REFERENCES "company_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
