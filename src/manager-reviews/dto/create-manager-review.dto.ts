import { IsString, IsNumber, IsEnum, IsOptional, IsUUID, IsDateString, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'

export enum ReviewStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED'
}

export class CreateManagerReviewDto {
  @IsUUID()
  employeeMasterId: string

  @IsUUID()
  managerId: string

  @IsString()
  reviewPeriod: string

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  overallRating: number

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  technicalSkills: number

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  communication: number

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  teamwork: number

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  leadership: number

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  problemSolving: number

  @IsString()
  strengths: string

  @IsString()
  areasForImprovement: string

  @IsString()
  goalsForNextPeriod: string

  @IsString()
  comments: string

  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatus

  @IsOptional()
  @IsDateString()
  submittedDate?: string
}

