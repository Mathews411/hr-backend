import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsUUID, IsDateString } from 'class-validator'
import { Type } from 'class-transformer'

export enum InterviewRoundType {
  TECHNICAL = 'TECHNICAL',
  HR = 'HR',
  MANAGERIAL = 'MANAGERIAL',
  FINAL = 'FINAL',
}

export enum InterviewMode {
  IN_PERSON = 'IN_PERSON',
  VIDEO_CALL = 'VIDEO_CALL',
  PHONE_CALL = 'PHONE_CALL',
}

export enum InterviewStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
}

export class CreateInterviewDto {
  @IsUUID()
  candidateApplicationId: string

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  roundNumber: number

  @IsEnum(InterviewRoundType)
  roundType: InterviewRoundType

  @IsDateString()
  interviewDate: string

  @IsString()
  interviewTime: string // Format: HH:mm

  @IsString()
  interviewer: string

  @IsString()
  location: string

  @IsEnum(InterviewMode)
  mode: InterviewMode

  @IsOptional()
  @IsEnum(InterviewStatus)
  status?: InterviewStatus

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @IsString()
  feedback?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  technicalSkills?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  communication?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  problemSolving?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  culturalFit?: number

  @IsOptional()
  @IsString()
  strengths?: string

  @IsOptional()
  @IsString()
  weaknesses?: string

  @IsOptional()
  @IsString()
  recommendation?: string

  @IsOptional()
  @IsString()
  feedbackStatus?: string
}

