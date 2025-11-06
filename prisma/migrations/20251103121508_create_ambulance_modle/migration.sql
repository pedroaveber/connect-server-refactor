-- CreateTable
CREATE TABLE "ambulances" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "observations" TEXT,
    "license_plate" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "base_id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "company_group_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,

    CONSTRAINT "ambulances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ambulances_license_plate_key" ON "ambulances"("license_plate");

-- CreateIndex
CREATE INDEX "ambulances_license_plate_idx" ON "ambulances"("license_plate");

-- AddForeignKey
ALTER TABLE "ambulances" ADD CONSTRAINT "ambulances_base_id_fkey" FOREIGN KEY ("base_id") REFERENCES "bases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ambulances" ADD CONSTRAINT "ambulances_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ambulances" ADD CONSTRAINT "ambulances_company_group_id_fkey" FOREIGN KEY ("company_group_id") REFERENCES "company_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ambulances" ADD CONSTRAINT "ambulances_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
