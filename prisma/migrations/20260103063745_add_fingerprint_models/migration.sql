-- CreateEnum
CREATE TYPE "FingerprintDeviceStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'OFFLINE');

-- CreateEnum
CREATE TYPE "FingerprintEnrollmentStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "FingerprintLogStatus" AS ENUM ('RECOGNIZED', 'FAILED', 'UNKNOWN', 'DUPLICATE');

-- CreateEnum
CREATE TYPE "FingerprintValidationAlertType" AS ENUM ('LOW_QUALITY', 'TEMPLATE_MISMATCH', 'DUPLICATE_ENROLLMENT', 'DEVICE_ERROR', 'COMMUNICATION_FAILURE');

-- CreateEnum
CREATE TYPE "FingerprintValidationSeverity" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "FingerprintValidationAlertStatus" AS ENUM ('ACTIVE', 'RESOLVED', 'FALSE_POSITIVE');

-- CreateTable
CREATE TABLE "fingerprint_devices" (
    "id" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "macAddress" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "port" INTEGER NOT NULL DEFAULT 4370,
    "status" "FingerprintDeviceStatus" NOT NULL DEFAULT 'INACTIVE',
    "lastConnected" TIMESTAMP(3),
    "recognitionAccuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "model" TEXT,
    "firmwareVersion" TEXT,
    "algorithm" TEXT,
    "platform" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fingerprint_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fingerprint_enrollments" (
    "id" TEXT NOT NULL,
    "employeeMasterId" TEXT NOT NULL,
    "fingerprintDeviceId" TEXT NOT NULL,
    "fingerprintTemplate" TEXT,
    "fingerprintIndex" INTEGER,
    "qualityScore" DOUBLE PRECISION,
    "status" "FingerprintEnrollmentStatus" NOT NULL DEFAULT 'PENDING',
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedDate" TIMESTAMP(3),
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fingerprint_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fingerprint_logs" (
    "id" TEXT NOT NULL,
    "employeeMasterId" TEXT,
    "fingerprintDeviceId" TEXT NOT NULL,
    "recognitionTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "FingerprintLogStatus" NOT NULL DEFAULT 'UNKNOWN',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fingerprintIndex" INTEGER,
    "location" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fingerprint_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fingerprint_validation_alerts" (
    "id" TEXT NOT NULL,
    "employeeMasterId" TEXT,
    "fingerprintDeviceId" TEXT NOT NULL,
    "alertTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alertType" "FingerprintValidationAlertType" NOT NULL,
    "severity" "FingerprintValidationSeverity" NOT NULL,
    "status" "FingerprintValidationAlertStatus" NOT NULL DEFAULT 'ACTIVE',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "location" TEXT,
    "description" TEXT NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fingerprint_validation_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fingerprint_devices_deviceId_key" ON "fingerprint_devices"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "fingerprint_devices_serialNumber_key" ON "fingerprint_devices"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "fingerprint_devices_macAddress_key" ON "fingerprint_devices"("macAddress");

-- CreateIndex
CREATE UNIQUE INDEX "fingerprint_enrollments_employeeMasterId_fingerprintDeviceI_key" ON "fingerprint_enrollments"("employeeMasterId", "fingerprintDeviceId", "fingerprintIndex");

-- CreateIndex
CREATE INDEX "fingerprint_logs_recognitionTime_idx" ON "fingerprint_logs"("recognitionTime");

-- CreateIndex
CREATE INDEX "fingerprint_logs_status_idx" ON "fingerprint_logs"("status");

-- CreateIndex
CREATE INDEX "fingerprint_logs_fingerprintDeviceId_idx" ON "fingerprint_logs"("fingerprintDeviceId");

-- CreateIndex
CREATE INDEX "fingerprint_validation_alerts_alertTime_idx" ON "fingerprint_validation_alerts"("alertTime");

-- CreateIndex
CREATE INDEX "fingerprint_validation_alerts_status_idx" ON "fingerprint_validation_alerts"("status");

-- CreateIndex
CREATE INDEX "fingerprint_validation_alerts_severity_idx" ON "fingerprint_validation_alerts"("severity");

-- CreateIndex
CREATE INDEX "fingerprint_validation_alerts_fingerprintDeviceId_idx" ON "fingerprint_validation_alerts"("fingerprintDeviceId");

-- AddForeignKey
ALTER TABLE "fingerprint_enrollments" ADD CONSTRAINT "fingerprint_enrollments_employeeMasterId_fkey" FOREIGN KEY ("employeeMasterId") REFERENCES "employee_masters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fingerprint_enrollments" ADD CONSTRAINT "fingerprint_enrollments_fingerprintDeviceId_fkey" FOREIGN KEY ("fingerprintDeviceId") REFERENCES "fingerprint_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fingerprint_logs" ADD CONSTRAINT "fingerprint_logs_employeeMasterId_fkey" FOREIGN KEY ("employeeMasterId") REFERENCES "employee_masters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fingerprint_logs" ADD CONSTRAINT "fingerprint_logs_fingerprintDeviceId_fkey" FOREIGN KEY ("fingerprintDeviceId") REFERENCES "fingerprint_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fingerprint_validation_alerts" ADD CONSTRAINT "fingerprint_validation_alerts_employeeMasterId_fkey" FOREIGN KEY ("employeeMasterId") REFERENCES "employee_masters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fingerprint_validation_alerts" ADD CONSTRAINT "fingerprint_validation_alerts_fingerprintDeviceId_fkey" FOREIGN KEY ("fingerprintDeviceId") REFERENCES "fingerprint_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
