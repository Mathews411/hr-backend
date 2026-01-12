import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator'
import { Type } from 'class-transformer'

export enum AppraisalCycleStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  EVALUATION = 'EVALUATION',
  REVIEW = 'REVIEW',
  COMPLETED = 'COMPLETED',
  CLOSED = 'CLOSED'
}

export class CreateAppraisalCycleDto {
  @IsString()
  cycleName: string

  @IsString()
  cycleCode: string

  @IsDateString()
  startDate: string

  @IsDateString()
  endDate: string

  @IsString()
  evaluationPeriod: string

  @IsOptional()
  @IsEnum(AppraisalCycleStatus)
  status?: AppraisalCycleStatus

  @IsOptional()
  @IsDateString()
  selfReviewDeadline?: string

  @IsOptional()
  @IsDateString()
  managerReviewDeadline?: string

  @IsOptional()
  @IsDateString()
  finalReviewDeadline?: string
}

