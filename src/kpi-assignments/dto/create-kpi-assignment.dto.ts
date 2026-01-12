import { IsString, IsNumber, IsEnum, IsOptional, IsUUID } from 'class-validator'
import { Type } from 'class-transformer'

export enum KPIAssignmentStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  INACTIVE = 'INACTIVE'
}

export class CreateKpiAssignmentDto {
  @IsUUID()
  employeeMasterId: string

  @IsUUID()
  kpiId: string

  @IsNumber()
  @Type(() => Number)
  targetValue: number

  @IsNumber()
  @Type(() => Number)
  weightage: number

  @IsString()
  evaluationPeriod: string

  @IsOptional()
  @IsEnum(KPIAssignmentStatus)
  status?: KPIAssignmentStatus
}

