import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator'

export enum TargetAudience {
  ALL_EMPLOYEES = 'ALL_EMPLOYEES',
  DEPARTMENT = 'DEPARTMENT',
  DESIGNATION = 'DESIGNATION',
  PROJECT = 'PROJECT',
  INDIVIDUAL = 'INDIVIDUAL',
}

export class CreateEmailAlertDto {
  @IsString()
  subject: string

  @IsString()
  emailBody: string

  @IsEnum(TargetAudience)
  targetAudience: TargetAudience

  @IsOptional()
  @IsString()
  targetDetails?: string

  @IsOptional()
  @IsString()
  templateId?: string

  @IsOptional()
  @IsDateString()
  scheduledDate?: string
}

