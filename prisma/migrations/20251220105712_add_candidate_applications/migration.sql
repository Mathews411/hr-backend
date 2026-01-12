-- CreateEnum
CREATE TYPE "CandidateApplicationStatus" AS ENUM ('APPLIED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'REJECTED', 'OFFER_EXTENDED', 'HIRED');

-- CreateTable
CREATE TABLE "candidate_applications" (
    "id" TEXT NOT NULL,
    "applicationNumber" TEXT NOT NULL,
    "candidateName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "jobOpeningId" TEXT NOT NULL,
    "experience" TEXT,
    "currentLocation" TEXT,
    "resumeUrl" TEXT,
    "coverLetter" TEXT,
    "education" TEXT,
    "skills" TEXT,
    "expectedSalary" DOUBLE PRECISION,
    "noticePeriod" TEXT,
    "status" "CandidateApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "appliedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "candidate_applications_applicationNumber_key" ON "candidate_applications"("applicationNumber");

-- AddForeignKey
ALTER TABLE "candidate_applications" ADD CONSTRAINT "candidate_applications_jobOpeningId_fkey" FOREIGN KEY ("jobOpeningId") REFERENCES "job_openings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
