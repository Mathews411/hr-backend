import { IsString, IsDateString, IsBoolean, IsOptional, IsEnum } from 'class-validator'

export class CreateShiftAssignmentDto {
  @IsString()
  projectId: string

  @IsOptional()
  @IsString()
  employeeId?: string

  @IsOptional()
  @IsString()
  departmentId?: string

  @IsString()
  shiftId: string

  @IsString()
  @IsEnum(['Employee', 'Department'])
  assignmentType: 'Employee' | 'Department'

  @IsDateString()
  startDate: string

  @IsOptional()
  @IsDateString()
  endDate?: string

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean

  @IsOptional()
  @IsString()
  recurringPattern?: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsString()
  assignedBy?: string
}

