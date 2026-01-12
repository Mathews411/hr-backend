import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator'

export class CreateEmploymentHistoryDto {
  @IsString()
  employeeMasterId: string

  @IsString()
  eventType: string

  @IsDateString()
  eventDate: string

  @IsDateString()
  effectiveDate: string

  @IsOptional()
  @IsString()
  previousValue?: string

  @IsString()
  newValue: string

  @IsOptional()
  @IsString()
  previousDepartment?: string

  @IsOptional()
  @IsString()
  newDepartment?: string

  @IsOptional()
  @IsString()
  previousDesignation?: string

  @IsOptional()
  @IsString()
  newDesignation?: string

  @IsOptional()
  @IsNumber()
  previousSalary?: number

  @IsOptional()
  @IsNumber()
  newSalary?: number

  @IsOptional()
  @IsString()
  previousStatus?: string

  @IsOptional()
  @IsString()
  newStatus?: string

  @IsOptional()
  @IsString()
  reason?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  approvedBy?: string

  @IsOptional()
  @IsString()
  remarks?: string
}

