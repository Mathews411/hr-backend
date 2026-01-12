-- AlterTable
ALTER TABLE "shifts" ADD COLUMN     "departmentIds" TEXT[],
ADD COLUMN     "designationIds" TEXT[],
ADD COLUMN     "locationId" TEXT;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
