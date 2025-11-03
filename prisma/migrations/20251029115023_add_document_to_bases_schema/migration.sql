/*
  Warnings:

  - A unique constraint covering the columns `[document]` on the table `bases` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "bases" ADD COLUMN     "document" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "bases_document_key" ON "bases"("document");
