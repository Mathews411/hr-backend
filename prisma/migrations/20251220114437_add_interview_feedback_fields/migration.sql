-- CreateEnum
CREATE TYPE "InterviewRecommendation" AS ENUM ('STRONGLY_RECOMMEND', 'RECOMMEND', 'NOT_SURE', 'NOT_RECOMMEND');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED');

-- AlterTable
ALTER TABLE "interviews" ADD COLUMN     "communication" INTEGER,
ADD COLUMN     "culturalFit" INTEGER,
ADD COLUMN     "feedbackStatus" "FeedbackStatus" NOT NULL DEFAULT 'SUBMITTED',
ADD COLUMN     "problemSolving" INTEGER,
ADD COLUMN     "recommendation" "InterviewRecommendation",
ADD COLUMN     "strengths" TEXT,
ADD COLUMN     "technicalSkills" INTEGER,
ADD COLUMN     "weaknesses" TEXT;
