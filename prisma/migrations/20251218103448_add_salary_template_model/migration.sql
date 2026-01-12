-- CreateTable
CREATE TABLE "salary_templates" (
    "id" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "templateCode" TEXT NOT NULL,
    "templateType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "components" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "salary_templates_templateCode_key" ON "salary_templates"("templateCode");
