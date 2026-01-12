-- CreateEnum
CREATE TYPE "IDCardStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "UniformAllocationStatus" AS ENUM ('ISSUED', 'RETURNED', 'LOST', 'DAMAGED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "EmployeeAssetStatus" AS ENUM ('ISSUED', 'RETURNED', 'LOST', 'DAMAGED', 'UNDER_REPAIR', 'EXPIRED');

-- CreateTable
CREATE TABLE "id_card_templates" (
    "id" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "templateCode" TEXT NOT NULL,
    "backgroundColor" TEXT NOT NULL DEFAULT '#ffffff',
    "textColor" TEXT NOT NULL DEFAULT '#1a1a1a',
    "accentColor" TEXT NOT NULL DEFAULT '#667eea',
    "logoPosition" TEXT NOT NULL DEFAULT 'left',
    "photoPosition" TEXT NOT NULL DEFAULT 'right',
    "showQRCode" BOOLEAN NOT NULL DEFAULT true,
    "showDepartment" BOOLEAN NOT NULL DEFAULT true,
    "showDesignation" BOOLEAN NOT NULL DEFAULT true,
    "showEmployeeCode" BOOLEAN NOT NULL DEFAULT true,
    "showJoiningDate" BOOLEAN NOT NULL DEFAULT false,
    "showExpiryDate" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "id_card_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_id_cards" (
    "id" TEXT NOT NULL,
    "employeeMasterId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "photoUrl" TEXT,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "status" "IDCardStatus" NOT NULL DEFAULT 'ACTIVE',
    "qrCode" TEXT,
    "printedDate" TIMESTAMP(3),
    "printedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generated_id_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uniform_items" (
    "id" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "itemCode" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "availableSizes" TEXT[],
    "unitCost" DOUBLE PRECISION NOT NULL,
    "totalQuantity" INTEGER NOT NULL DEFAULT 0,
    "allocatedQuantity" INTEGER NOT NULL DEFAULT 0,
    "availableQuantity" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "uniform_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uniform_allocations" (
    "id" TEXT NOT NULL,
    "employeeMasterId" TEXT NOT NULL,
    "uniformItemId" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnDate" TIMESTAMP(3),
    "expectedReturnDate" TIMESTAMP(3),
    "status" "UniformAllocationStatus" NOT NULL DEFAULT 'ISSUED',
    "condition" TEXT,
    "remarks" TEXT,
    "issuedBy" TEXT,
    "returnedBy" TEXT,
    "returnedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "uniform_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_items" (
    "id" TEXT NOT NULL,
    "assetName" TEXT NOT NULL,
    "assetCode" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "purchaseCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "warrantyPeriod" INTEGER,
    "warrantyExpiryDate" TIMESTAMP(3),
    "totalQuantity" INTEGER NOT NULL DEFAULT 0,
    "allocatedQuantity" INTEGER NOT NULL DEFAULT 0,
    "availableQuantity" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_assets" (
    "id" TEXT NOT NULL,
    "employeeMasterId" TEXT NOT NULL,
    "assetItemId" TEXT NOT NULL,
    "serialNumber" TEXT,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnDate" TIMESTAMP(3),
    "expectedReturnDate" TIMESTAMP(3),
    "status" "EmployeeAssetStatus" NOT NULL DEFAULT 'ISSUED',
    "condition" TEXT,
    "warrantyExpiryDate" TIMESTAMP(3),
    "location" TEXT,
    "remarks" TEXT,
    "issuedBy" TEXT,
    "returnedBy" TEXT,
    "returnedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employment_history" (
    "id" TEXT NOT NULL,
    "employeeMasterId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "previousValue" TEXT,
    "newValue" TEXT NOT NULL,
    "previousDepartment" TEXT,
    "newDepartment" TEXT,
    "previousDesignation" TEXT,
    "newDesignation" TEXT,
    "previousSalary" DOUBLE PRECISION,
    "newSalary" DOUBLE PRECISION,
    "previousStatus" TEXT,
    "newStatus" TEXT,
    "reason" TEXT,
    "description" TEXT,
    "approvedBy" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employment_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "id_card_templates_templateCode_key" ON "id_card_templates"("templateCode");

-- CreateIndex
CREATE UNIQUE INDEX "uniform_items_itemCode_key" ON "uniform_items"("itemCode");

-- CreateIndex
CREATE UNIQUE INDEX "asset_items_assetCode_key" ON "asset_items"("assetCode");

-- AddForeignKey
ALTER TABLE "generated_id_cards" ADD CONSTRAINT "generated_id_cards_employeeMasterId_fkey" FOREIGN KEY ("employeeMasterId") REFERENCES "employee_masters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_id_cards" ADD CONSTRAINT "generated_id_cards_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "id_card_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uniform_allocations" ADD CONSTRAINT "uniform_allocations_employeeMasterId_fkey" FOREIGN KEY ("employeeMasterId") REFERENCES "employee_masters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uniform_allocations" ADD CONSTRAINT "uniform_allocations_uniformItemId_fkey" FOREIGN KEY ("uniformItemId") REFERENCES "uniform_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_assets" ADD CONSTRAINT "employee_assets_employeeMasterId_fkey" FOREIGN KEY ("employeeMasterId") REFERENCES "employee_masters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_assets" ADD CONSTRAINT "employee_assets_assetItemId_fkey" FOREIGN KEY ("assetItemId") REFERENCES "asset_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employment_history" ADD CONSTRAINT "employment_history_employeeMasterId_fkey" FOREIGN KEY ("employeeMasterId") REFERENCES "employee_masters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
