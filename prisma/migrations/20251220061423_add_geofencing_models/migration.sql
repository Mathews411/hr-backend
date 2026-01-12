-- CreateEnum
CREATE TYPE "GeofenceType" AS ENUM ('OFFICE', 'PROJECT_SITE', 'CLIENT_LOCATION', 'OTHER');

-- CreateEnum
CREATE TYPE "GeofenceStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "GeofenceAssignmentStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "GPSPunchType" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "GPSPunchStatus" AS ENUM ('VALID', 'INVALID', 'OUTSIDE_GEOFENCE');

-- CreateEnum
CREATE TYPE "GPSRouteStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'PAUSED');

-- CreateEnum
CREATE TYPE "LocationAlertType" AS ENUM ('OUTSIDE_GEOFENCE', 'NO_GPS_SIGNAL', 'LOCATION_MISMATCH', 'ROUTE_DEVIATION');

-- CreateEnum
CREATE TYPE "LocationAlertSeverity" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "LocationAlertStatus" AS ENUM ('ACTIVE', 'RESOLVED', 'FALSE_POSITIVE');

-- CreateTable
CREATE TABLE "geofence_areas" (
    "id" TEXT NOT NULL,
    "geofenceName" TEXT NOT NULL,
    "geofenceCode" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "radius" DOUBLE PRECISION NOT NULL,
    "type" "GeofenceType" NOT NULL,
    "status" "GeofenceStatus" NOT NULL DEFAULT 'INACTIVE',
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "geofence_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geofence_project_assignments" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "geofenceAreaId" TEXT NOT NULL,
    "assignedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,
    "status" "GeofenceAssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "geofence_project_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gps_punches" (
    "id" TEXT NOT NULL,
    "employeeMasterId" TEXT NOT NULL,
    "projectId" TEXT,
    "geofenceAreaId" TEXT,
    "punchType" "GPSPunchType" NOT NULL,
    "punchTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "location" TEXT NOT NULL,
    "distance" DOUBLE PRECISION,
    "status" "GPSPunchStatus" NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gps_punches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gps_route_logs" (
    "id" TEXT NOT NULL,
    "employeeMasterId" TEXT NOT NULL,
    "projectId" TEXT,
    "date" DATE NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "startLocation" TEXT NOT NULL,
    "endLocation" TEXT,
    "startLatitude" DOUBLE PRECISION NOT NULL,
    "startLongitude" DOUBLE PRECISION NOT NULL,
    "endLatitude" DOUBLE PRECISION,
    "endLongitude" DOUBLE PRECISION,
    "totalDistance" DOUBLE PRECISION,
    "totalDuration" INTEGER,
    "status" "GPSRouteStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gps_route_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gps_route_waypoints" (
    "id" TEXT NOT NULL,
    "routeLogId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "location" TEXT NOT NULL,
    "speed" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gps_route_waypoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_deviation_alerts" (
    "id" TEXT NOT NULL,
    "employeeMasterId" TEXT NOT NULL,
    "projectId" TEXT,
    "geofenceAreaId" TEXT,
    "alertTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alertType" "LocationAlertType" NOT NULL,
    "severity" "LocationAlertSeverity" NOT NULL,
    "status" "LocationAlertStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentLatitude" DOUBLE PRECISION NOT NULL,
    "currentLongitude" DOUBLE PRECISION NOT NULL,
    "expectedLatitude" DOUBLE PRECISION,
    "expectedLongitude" DOUBLE PRECISION,
    "deviationDistance" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "location_deviation_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "geofence_areas_geofenceCode_key" ON "geofence_areas"("geofenceCode");

-- CreateIndex
CREATE UNIQUE INDEX "geofence_project_assignments_projectId_geofenceAreaId_key" ON "geofence_project_assignments"("projectId", "geofenceAreaId");

-- CreateIndex
CREATE INDEX "gps_punches_punchTime_idx" ON "gps_punches"("punchTime");

-- CreateIndex
CREATE INDEX "gps_punches_employeeMasterId_idx" ON "gps_punches"("employeeMasterId");

-- CreateIndex
CREATE INDEX "gps_punches_status_idx" ON "gps_punches"("status");

-- CreateIndex
CREATE INDEX "gps_route_logs_date_idx" ON "gps_route_logs"("date");

-- CreateIndex
CREATE INDEX "gps_route_logs_employeeMasterId_idx" ON "gps_route_logs"("employeeMasterId");

-- CreateIndex
CREATE INDEX "gps_route_logs_status_idx" ON "gps_route_logs"("status");

-- CreateIndex
CREATE INDEX "gps_route_waypoints_routeLogId_idx" ON "gps_route_waypoints"("routeLogId");

-- CreateIndex
CREATE INDEX "location_deviation_alerts_alertTime_idx" ON "location_deviation_alerts"("alertTime");

-- CreateIndex
CREATE INDEX "location_deviation_alerts_status_idx" ON "location_deviation_alerts"("status");

-- CreateIndex
CREATE INDEX "location_deviation_alerts_severity_idx" ON "location_deviation_alerts"("severity");

-- AddForeignKey
ALTER TABLE "geofence_project_assignments" ADD CONSTRAINT "geofence_project_assignments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geofence_project_assignments" ADD CONSTRAINT "geofence_project_assignments_geofenceAreaId_fkey" FOREIGN KEY ("geofenceAreaId") REFERENCES "geofence_areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gps_punches" ADD CONSTRAINT "gps_punches_employeeMasterId_fkey" FOREIGN KEY ("employeeMasterId") REFERENCES "employee_masters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gps_punches" ADD CONSTRAINT "gps_punches_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gps_punches" ADD CONSTRAINT "gps_punches_geofenceAreaId_fkey" FOREIGN KEY ("geofenceAreaId") REFERENCES "geofence_areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gps_route_logs" ADD CONSTRAINT "gps_route_logs_employeeMasterId_fkey" FOREIGN KEY ("employeeMasterId") REFERENCES "employee_masters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gps_route_logs" ADD CONSTRAINT "gps_route_logs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gps_route_waypoints" ADD CONSTRAINT "gps_route_waypoints_routeLogId_fkey" FOREIGN KEY ("routeLogId") REFERENCES "gps_route_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_deviation_alerts" ADD CONSTRAINT "location_deviation_alerts_employeeMasterId_fkey" FOREIGN KEY ("employeeMasterId") REFERENCES "employee_masters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_deviation_alerts" ADD CONSTRAINT "location_deviation_alerts_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_deviation_alerts" ADD CONSTRAINT "location_deviation_alerts_geofenceAreaId_fkey" FOREIGN KEY ("geofenceAreaId") REFERENCES "geofence_areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
