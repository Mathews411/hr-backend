import { IsString, IsNumber, IsDateString, IsEnum, IsOptional, Min, Max } from 'class-validator'
import { EmployeeAssignmentStatus } from '@prisma/client'

export class CreateEmployeeAssignmentDto {
  @IsString()
  employeeId: string

  @IsString()
  projectId: string

  @IsString()
  role: string

  @IsNumber()
  @Min(1)
  @Max(100)
  allocationPercentage: number

  @IsDateString()
  startDate: string

  @IsOptional()
  @IsDateString()
  endDate?: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number

  @IsOptional()
  @IsEnum(EmployeeAssignmentStatus)
  status?: EmployeeAssignmentStatus

  @IsOptional()
  @IsString()
  assignedBy?: string
}

