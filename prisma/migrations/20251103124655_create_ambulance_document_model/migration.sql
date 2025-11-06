-- CreateTable
CREATE TABLE "ambulance_documents" (
    "id" TEXT NOT NULL,
    "ambulance_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "download_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ambulance_documents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ambulance_documents" ADD CONSTRAINT "ambulance_documents_ambulance_id_fkey" FOREIGN KEY ("ambulance_id") REFERENCES "ambulances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
