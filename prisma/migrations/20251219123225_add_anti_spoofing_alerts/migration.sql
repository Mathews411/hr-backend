-- CreateEnum
CREATE TYPE "AntiSpoofingAlertType" AS ENUM ('PHOTO_DETECTION', 'VIDEO_REPLAY', 'MASK_DETECTION', 'MODEL_3D', 'LIVENESS_FAILURE');

-- CreateEnum
CREATE TYPE "AntiSpoofingSeverity" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "AntiSpoofingAlertStatus" AS ENUM ('ACTIVE', 'RESOLVED', 'FALSE_POSITIVE');

-- CreateTable
CREATE TABLE "anti_spoofing_alerts" (
    "id" TEXT NOT NULL,
    "employeeMasterId" TEXT,
    "cameraDeviceId" TEXT NOT NULL,
    "alertTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alertType" "AntiSpoofingAlertType" NOT NULL,
    "severity" "AntiSpoofingSeverity" NOT NULL,
    "status" "AntiSpoofingAlertStatus" NOT NULL DEFAULT 'ACTIVE',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "location" TEXT,
    "description" TEXT NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anti_spoofing_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "anti_spoofing_alerts_alertTime_idx" ON "anti_spoofing_alerts"("alertTime");

-- CreateIndex
CREATE INDEX "anti_spoofing_alerts_status_idx" ON "anti_spoofing_alerts"("status");

-- CreateIndex
CREATE INDEX "anti_spoofing_alerts_severity_idx" ON "anti_spoofing_alerts"("severity");

-- CreateIndex
CREATE INDEX "anti_spoofing_alerts_cameraDeviceId_idx" ON "anti_spoofing_alerts"("cameraDeviceId");

-- AddForeignKey
ALTER TABLE "anti_spoofing_alerts" ADD CONSTRAINT "anti_spoofing_alerts_employeeMasterId_fkey" FOREIGN KEY ("employeeMasterId") REFERENCES "employee_masters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anti_spoofing_alerts" ADD CONSTRAINT "anti_spoofing_alerts_cameraDeviceId_fkey" FOREIGN KEY ("cameraDeviceId") REFERENCES "camera_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
