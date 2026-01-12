-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "budget" DOUBLE PRECISION,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "clientName" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "priority" TEXT,
ADD COLUMN     "progress" INTEGER,
ADD COLUMN     "spent" DOUBLE PRECISION;
