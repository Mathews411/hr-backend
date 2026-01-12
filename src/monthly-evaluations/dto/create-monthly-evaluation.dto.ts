import { IsString, IsNumber, IsEnum, IsOptional, IsUUID, IsDateString } from 'class-validator'
import { Type } from 'class-transformer'

export enum EvaluationStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  APPROVED = 'APPROVED'
}

export class CreateMonthlyEvaluationDto {
  @IsUUID()
  employeeMasterId: string

  @IsString()
  evaluationMonth: string // YYYY-MM

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  kpiCount?: number

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  totalScore?: number

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxScore?: number

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  percentage?: number

  @IsOptional()
  @IsEnum(EvaluationStatus)
  status?: EvaluationStatus
}

