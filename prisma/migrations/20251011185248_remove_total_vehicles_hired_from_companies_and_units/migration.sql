/*
  Warnings:

  - You are about to drop the column `total_vehicles_hired` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `total_vehicles_hired` on the `units` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "companies" DROP COLUMN "total_vehicles_hired";

-- AlterTable
ALTER TABLE "units" DROP COLUMN "total_vehicles_hired";
