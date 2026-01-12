import { IsString, IsNumber, IsEnum, IsOptional, IsUUID, IsDateString, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'

export enum SelfReviewStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  REVIEWED = 'REVIEWED'
}

export class CreateSelfReviewDto {
  @IsUUID()
  employeeMasterId: string

  @IsString()
  reviewPeriod: string

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  overallRating: number

  @IsString()
  achievements: string

  @IsString()
  challenges: string

  @IsString()
  skillsLearned: string

  @IsString()
  goalsAchieved: string

  @IsString()
  goalsForNextPeriod: string

  @IsString()
  supportNeeded: string

  @IsOptional()
  @IsEnum(SelfReviewStatus)
  status?: SelfReviewStatus

  @IsOptional()
  @IsDateString()
  submittedDate?: string
}

