-- AlterTable
ALTER TABLE "candidate_applications" ADD COLUMN     "screenedBy" TEXT,
ADD COLUMN     "screenedDate" TIMESTAMP(3),
ADD COLUMN     "screeningNotes" TEXT,
ADD COLUMN     "screeningScore" INTEGER;
