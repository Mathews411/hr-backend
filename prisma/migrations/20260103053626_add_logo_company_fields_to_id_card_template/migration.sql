-- AlterTable
ALTER TABLE "id_card_templates" ADD COLUMN     "companyAddress" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "showEmployeePhoto" BOOLEAN NOT NULL DEFAULT true;
