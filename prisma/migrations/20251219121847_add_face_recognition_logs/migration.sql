-- CreateEnum
CREATE TYPE "FaceRecognitionStatus" AS ENUM ('RECOGNIZED', 'FAILED', 'UNKNOWN');

-- CreateTable
CREATE TABLE "face_recognition_logs" (
    "id" TEXT NOT NULL,
    "employeeMasterId" TEXT,
    "cameraDeviceId" TEXT NOT NULL,
    "recognitionTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "FaceRecognitionStatus" NOT NULL DEFAULT 'UNKNOWN',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "location" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "face_recognition_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "face_recognition_logs_recognitionTime_idx" ON "face_recognition_logs"("recognitionTime");

-- CreateIndex
CREATE INDEX "face_recognition_logs_status_idx" ON "face_recognition_logs"("status");

-- CreateIndex
CREATE INDEX "face_recognition_logs_cameraDeviceId_idx" ON "face_recognition_logs"("cameraDeviceId");

-- AddForeignKey
ALTER TABLE "face_recognition_logs" ADD CONSTRAINT "face_recognition_logs_employeeMasterId_fkey" FOREIGN KEY ("employeeMasterId") REFERENCES "employee_masters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "face_recognition_logs" ADD CONSTRAINT "face_recognition_logs_cameraDeviceId_fkey" FOREIGN KEY ("cameraDeviceId") REFERENCES "camera_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
