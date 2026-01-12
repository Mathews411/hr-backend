-- CreateEnum
CREATE TYPE "CameraDeviceStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'OFFLINE');

-- CreateTable
CREATE TABLE "camera_devices" (
    "id" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "port" INTEGER NOT NULL DEFAULT 8080,
    "status" "CameraDeviceStatus" NOT NULL DEFAULT 'INACTIVE',
    "lastConnected" TIMESTAMP(3),
    "recognitionAccuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "model" TEXT,
    "firmwareVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "camera_devices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "camera_devices_deviceId_key" ON "camera_devices"("deviceId");
