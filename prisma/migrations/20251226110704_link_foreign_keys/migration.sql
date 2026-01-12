-- AlterTable: Add new foreign key columns (keeping old columns for data migration)
ALTER TABLE "employee_masters" 
ADD COLUMN     "reportingManagerId" TEXT,
ADD COLUMN     "workLocationId" TEXT;

-- AlterTable: Add new foreign key column for projects
ALTER TABLE "projects" 
ADD COLUMN     "categoryId" TEXT;

-- Note: Old columns (reportingManager, workLocation, category) are kept for now
-- You can migrate data and drop them in a follow-up migration if needed

-- AddForeignKey: Projects -> ProjectCategory
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'projects_categoryId_fkey'
    ) THEN
        ALTER TABLE "projects" ADD CONSTRAINT "projects_categoryId_fkey" 
        FOREIGN KEY ("categoryId") REFERENCES "project_categories"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey: EmployeeMaster -> Department (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'employee_masters_departmentId_fkey'
    ) THEN
        ALTER TABLE "employee_masters" ADD CONSTRAINT "employee_masters_departmentId_fkey" 
        FOREIGN KEY ("departmentId") REFERENCES "departments"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey: EmployeeMaster -> Designation (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'employee_masters_designationId_fkey'
    ) THEN
        ALTER TABLE "employee_masters" ADD CONSTRAINT "employee_masters_designationId_fkey" 
        FOREIGN KEY ("designationId") REFERENCES "designations"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey: EmployeeMaster -> SalaryTemplate (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'employee_masters_salaryTemplateId_fkey'
    ) THEN
        ALTER TABLE "employee_masters" ADD CONSTRAINT "employee_masters_salaryTemplateId_fkey" 
        FOREIGN KEY ("salaryTemplateId") REFERENCES "salary_templates"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey: EmployeeMaster -> Location
ALTER TABLE "employee_masters" ADD CONSTRAINT "employee_masters_workLocationId_fkey" 
FOREIGN KEY ("workLocationId") REFERENCES "locations"("id") 
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: EmployeeMaster -> Shift
ALTER TABLE "employee_masters" ADD CONSTRAINT "employee_masters_shiftId_fkey" 
FOREIGN KEY ("shiftId") REFERENCES "shifts"("id") 
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: EmployeeMaster -> EmployeeMaster (self-referential for reporting manager)
ALTER TABLE "employee_masters" ADD CONSTRAINT "employee_masters_reportingManagerId_fkey" 
FOREIGN KEY ("reportingManagerId") REFERENCES "employee_masters"("id") 
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: ShiftAssignment -> Department
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_departmentId_fkey" 
FOREIGN KEY ("departmentId") REFERENCES "departments"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: ShiftAssignment -> Shift
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_shiftId_fkey" 
FOREIGN KEY ("shiftId") REFERENCES "shifts"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: WhatsAppNotification -> NotificationTemplate
ALTER TABLE "whatsapp_notifications" ADD CONSTRAINT "whatsapp_notifications_templateId_fkey" 
FOREIGN KEY ("templateId") REFERENCES "notification_templates"("id") 
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: EmailAlert -> NotificationTemplate
ALTER TABLE "email_alerts" ADD CONSTRAINT "email_alerts_templateId_fkey" 
FOREIGN KEY ("templateId") REFERENCES "notification_templates"("id") 
ON DELETE SET NULL ON UPDATE CASCADE;
