/*
  Warnings:

  - You are about to drop the column `reportingManager` on the `employee_masters` table. All the data in the column will be lost.
  - You are about to drop the column `workLocation` on the `employee_masters` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `projects` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "employee_masters" DROP COLUMN "reportingManager",
DROP COLUMN "workLocation";

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "category";
