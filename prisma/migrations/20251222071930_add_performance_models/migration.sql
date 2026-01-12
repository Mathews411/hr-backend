-- CreateEnum
CREATE TYPE "KPIFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL');

-- CreateEnum
CREATE TYPE "KPIAssignmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "EvaluationStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'APPROVED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED');

-- CreateEnum
CREATE TYPE "SelfReviewStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'REVIEWED');

-- CreateEnum
CREATE TYPE "AppraisalCycleStatus" AS ENUM ('PLANNING', 'ACTIVE', 'EVALUATION', 'REVIEW', 'COMPLETED', 'CLOSED');

-- CreateEnum
CREATE TYPE "PromotionStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ON_HOLD');

-- CreateTable
CREATE TABLE "kpis" (
    "id" TEXT NOT NULL,
    "kpiName" TEXT NOT NULL,
    "kpiCode" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "measurementUnit" TEXT NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "weightage" DOUBLE PRECISION NOT NULL,
    "frequency" "KPIFrequency" NOT NULL,
    "department" TEXT,
    "designation" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kpis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_assignments" (
    "id" TEXT NOT NULL,
    "employeeMasterId" TEXT NOT NULL,
    "kpiId" TEXT NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "weightage" DOUBLE PRECISION NOT NULL,
    "assignedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evaluationPeriod" TEXT NOT NULL,
    "assignedBy" TEXT,
    "status" "KPIAssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kpi_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_evaluations" (
    "id" TEXT NOT NULL,
    "employeeMasterId" TEXT NOT NULL,
    "evaluationMonth" TEXT NOT NULL,
    "kpiCount" INTEGER NOT NULL DEFAULT 0,
    "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "EvaluationStatus" NOT NULL DEFAULT 'PENDING',
    "evaluatedBy" TEXT,
    "evaluatedDate" TIMESTAMP(3),
    "approvedBy" TEXT,
    "approvedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_evaluations" (
    "id" TEXT NOT NULL,
    "monthlyEvaluationId" TEXT NOT NULL,
    "kpiAssignmentId" TEXT NOT NULL,
    "achievedValue" DOUBLE PRECISION NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kpi_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manager_reviews" (
    "id" TEXT NOT NULL,
    "employeeMasterId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "reviewPeriod" TEXT NOT NULL,
    "overallRating" DOUBLE PRECISION NOT NULL,
    "technicalSkills" DOUBLE PRECISION NOT NULL,
    "communication" DOUBLE PRECISION NOT NULL,
    "teamwork" DOUBLE PRECISION NOT NULL,
    "leadership" DOUBLE PRECISION NOT NULL,
    "problemSolving" DOUBLE PRECISION NOT NULL,
    "strengths" TEXT NOT NULL,
    "areasForImprovement" TEXT NOT NULL,
    "goalsForNextPeriod" TEXT NOT NULL,
    "comments" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedDate" TIMESTAMP(3),
    "approvedDate" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manager_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "self_reviews" (
    "id" TEXT NOT NULL,
    "employeeMasterId" TEXT NOT NULL,
    "reviewPeriod" TEXT NOT NULL,
    "overallRating" DOUBLE PRECISION NOT NULL,
    "achievements" TEXT NOT NULL,
    "challenges" TEXT NOT NULL,
    "skillsLearned" TEXT NOT NULL,
    "goalsAchieved" TEXT NOT NULL,
    "goalsForNextPeriod" TEXT NOT NULL,
    "supportNeeded" TEXT NOT NULL,
    "status" "SelfReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedDate" TIMESTAMP(3),
    "reviewedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "self_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appraisal_cycles" (
    "id" TEXT NOT NULL,
    "cycleName" TEXT NOT NULL,
    "cycleCode" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "evaluationPeriod" TEXT NOT NULL,
    "status" "AppraisalCycleStatus" NOT NULL DEFAULT 'PLANNING',
    "totalEmployees" INTEGER NOT NULL DEFAULT 0,
    "completedEvaluations" INTEGER NOT NULL DEFAULT 0,
    "pendingEvaluations" INTEGER NOT NULL DEFAULT 0,
    "selfReviewDeadline" TIMESTAMP(3),
    "managerReviewDeadline" TIMESTAMP(3),
    "finalReviewDeadline" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appraisal_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_recommendations" (
    "id" TEXT NOT NULL,
    "employeeMasterId" TEXT NOT NULL,
    "currentDepartment" TEXT NOT NULL,
    "currentDesignation" TEXT NOT NULL,
    "recommendedDepartment" TEXT,
    "recommendedDesignation" TEXT NOT NULL,
    "currentSalary" DOUBLE PRECISION NOT NULL,
    "recommendedSalary" DOUBLE PRECISION NOT NULL,
    "recommendationReason" TEXT NOT NULL,
    "performanceScore" DOUBLE PRECISION NOT NULL,
    "yearsInCurrentRole" DOUBLE PRECISION NOT NULL,
    "recommendedBy" TEXT,
    "recommendationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "PromotionStatus" NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedDate" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promotion_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kpis_kpiCode_key" ON "kpis"("kpiCode");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_assignments_employeeMasterId_kpiId_evaluationPeriod_sta_key" ON "kpi_assignments"("employeeMasterId", "kpiId", "evaluationPeriod", "status");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_evaluations_employeeMasterId_evaluationMonth_key" ON "monthly_evaluations"("employeeMasterId", "evaluationMonth");

-- CreateIndex
CREATE UNIQUE INDEX "manager_reviews_employeeMasterId_reviewPeriod_key" ON "manager_reviews"("employeeMasterId", "reviewPeriod");

-- CreateIndex
CREATE UNIQUE INDEX "self_reviews_employeeMasterId_reviewPeriod_key" ON "self_reviews"("employeeMasterId", "reviewPeriod");

-- CreateIndex
CREATE UNIQUE INDEX "appraisal_cycles_cycleCode_key" ON "appraisal_cycles"("cycleCode");

-- AddForeignKey
ALTER TABLE "kpi_assignments" ADD CONSTRAINT "kpi_assignments_employeeMasterId_fkey" FOREIGN KEY ("employeeMasterId") REFERENCES "employee_masters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_assignments" ADD CONSTRAINT "kpi_assignments_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES "kpis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_evaluations" ADD CONSTRAINT "monthly_evaluations_employeeMasterId_fkey" FOREIGN KEY ("employeeMasterId") REFERENCES "employee_masters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_evaluations" ADD CONSTRAINT "kpi_evaluations_monthlyEvaluationId_fkey" FOREIGN KEY ("monthlyEvaluationId") REFERENCES "monthly_evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_evaluations" ADD CONSTRAINT "kpi_evaluations_kpiAssignmentId_fkey" FOREIGN KEY ("kpiAssignmentId") REFERENCES "kpi_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_reviews" ADD CONSTRAINT "manager_reviews_employeeMasterId_fkey" FOREIGN KEY ("employeeMasterId") REFERENCES "employee_masters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_reviews" ADD CONSTRAINT "manager_reviews_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "employee_masters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "self_reviews" ADD CONSTRAINT "self_reviews_employeeMasterId_fkey" FOREIGN KEY ("employeeMasterId") REFERENCES "employee_masters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_recommendations" ADD CONSTRAINT "promotion_recommendations_employeeMasterId_fkey" FOREIGN KEY ("employeeMasterId") REFERENCES "employee_masters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
