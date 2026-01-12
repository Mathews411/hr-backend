-- CreateEnum
CREATE TYPE "FaceEnrollmentStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "face_enrollments" (
    "id" TEXT NOT NULL,
    "employeeMasterId" TEXT NOT NULL,
    "status" "FaceEnrollmentStatus" NOT NULL DEFAULT 'PENDING',
    "faceImages" INTEGER NOT NULL DEFAULT 0,
    "qualityScore" DOUBLE PRECISION,
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedDate" TIMESTAMP(3),
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "face_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "face_images" (
    "id" TEXT NOT NULL,
    "faceEnrollmentId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageName" TEXT NOT NULL,
    "imageSize" INTEGER NOT NULL,
    "qualityScore" DOUBLE PRECISION,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "face_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "face_enrollments" ADD CONSTRAINT "face_enrollments_employeeMasterId_fkey" FOREIGN KEY ("employeeMasterId") REFERENCES "employee_masters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "face_images" ADD CONSTRAINT "face_images_faceEnrollmentId_fkey" FOREIGN KEY ("faceEnrollmentId") REFERENCES "face_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
