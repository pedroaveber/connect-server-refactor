-- CreateEnum
CREATE TYPE "AmbulanceStatusEnum" AS ENUM ('QAP', 'OCP', 'EVT', 'J4', 'J5', 'FA', 'MN');

-- AlterTable
ALTER TABLE "ambulances" ADD COLUMN     "status" "AmbulanceStatusEnum" NOT NULL DEFAULT 'FA';

-- CreateTable
CREATE TABLE "ambulance_status_histories" (
    "id" TEXT NOT NULL,
    "ambulance_id" TEXT NOT NULL,
    "from_status" "AmbulanceStatusEnum" NOT NULL,
    "to_status" "AmbulanceStatusEnum" NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ambulance_status_histories_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ambulance_status_histories" ADD CONSTRAINT "ambulance_status_histories_ambulance_id_fkey" FOREIGN KEY ("ambulance_id") REFERENCES "ambulances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ambulance_status_histories" ADD CONSTRAINT "ambulance_status_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
