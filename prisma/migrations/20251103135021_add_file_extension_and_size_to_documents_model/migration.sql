/*
  Warnings:

  - Added the required column `file_extension` to the `ambulance_documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_size` to the `ambulance_documents` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ambulance_documents" ADD COLUMN     "file_extension" TEXT NOT NULL,
ADD COLUMN     "file_size" INTEGER NOT NULL;
