-- CreateEnum
CREATE TYPE "OfferLetterStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD');

-- CreateTable
CREATE TABLE "offer_letters" (
    "id" TEXT NOT NULL,
    "offerNumber" TEXT NOT NULL,
    "candidateApplicationId" TEXT NOT NULL,
    "offerDate" TIMESTAMP(3) NOT NULL,
    "joiningDate" TIMESTAMP(3) NOT NULL,
    "salary" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "designation" TEXT NOT NULL,
    "offerLetterUrl" TEXT,
    "status" "OfferLetterStatus" NOT NULL DEFAULT 'DRAFT',
    "sentDate" TIMESTAMP(3),
    "acceptedDate" TIMESTAMP(3),
    "rejectedDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offer_letters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_onboardings" (
    "id" TEXT NOT NULL,
    "candidateApplicationId" TEXT NOT NULL,
    "employeeId" TEXT,
    "employeeCode" TEXT,
    "offerAcceptedDate" TIMESTAMP(3) NOT NULL,
    "joiningDate" TIMESTAMP(3) NOT NULL,
    "onboardingStatus" "OnboardingStatus" NOT NULL DEFAULT 'PENDING',
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "totalSteps" INTEGER NOT NULL DEFAULT 5,
    "documentsSubmitted" INTEGER NOT NULL DEFAULT 0,
    "totalDocuments" INTEGER NOT NULL DEFAULT 6,
    "notes" TEXT,
    "completedDate" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_onboardings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "offer_letters_offerNumber_key" ON "offer_letters"("offerNumber");

-- CreateIndex
CREATE UNIQUE INDEX "offer_letters_candidateApplicationId_key" ON "offer_letters"("candidateApplicationId");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_onboardings_candidateApplicationId_key" ON "candidate_onboardings"("candidateApplicationId");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_onboardings_employeeId_key" ON "candidate_onboardings"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_onboardings_employeeCode_key" ON "candidate_onboardings"("employeeCode");

-- AddForeignKey
ALTER TABLE "offer_letters" ADD CONSTRAINT "offer_letters_candidateApplicationId_fkey" FOREIGN KEY ("candidateApplicationId") REFERENCES "candidate_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_onboardings" ADD CONSTRAINT "candidate_onboardings_candidateApplicationId_fkey" FOREIGN KEY ("candidateApplicationId") REFERENCES "candidate_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
