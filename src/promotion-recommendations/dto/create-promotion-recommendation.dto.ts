import { IsString, IsNumber, IsEnum, IsOptional, IsUUID, IsDateString } from 'class-validator'
import { Type } from 'class-transformer'

export enum PromotionStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ON_HOLD = 'ON_HOLD'
}

export class CreatePromotionRecommendationDto {
  @IsUUID()
  employeeMasterId: string

  @IsString()
  currentDepartment: string

  @IsString()
  currentDesignation: string

  @IsOptional()
  @IsString()
  recommendedDepartment?: string

  @IsString()
  recommendedDesignation: string

  @IsNumber()
  @Type(() => Number)
  currentSalary: number

  @IsNumber()
  @Type(() => Number)
  recommendedSalary: number

  @IsString()
  recommendationReason: string

  @IsNumber()
  @Type(() => Number)
  performanceScore: number

  @IsNumber()
  @Type(() => Number)
  yearsInCurrentRole: number

  @IsOptional()
  @IsEnum(PromotionStatus)
  status?: PromotionStatus
}

