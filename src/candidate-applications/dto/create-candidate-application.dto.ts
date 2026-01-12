import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsEmail } from 'class-validator'
import { Type } from 'class-transformer'

export enum CandidateApplicationStatus {
  APPLIED = 'APPLIED',
  SCREENING = 'SCREENING',
  SHORTLISTED = 'SHORTLISTED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  REJECTED = 'REJECTED',
  OFFER_EXTENDED = 'OFFER_EXTENDED',
  HIRED = 'HIRED',
}

export class CreateCandidateApplicationDto {
  @IsString()
  candidateName: string

  @IsEmail()
  email: string

  @IsString()
  phone: string

  @IsString()
  jobOpeningId: string

  @IsOptional()
  @IsString()
  experience?: string

  @IsOptional()
  @IsString()
  currentLocation?: string

  @IsOptional()
  @IsString()
  resumeUrl?: string

  @IsOptional()
  @IsString()
  coverLetter?: string

  @IsOptional()
  @IsString()
  education?: string

  @IsOptional()
  @IsString()
  skills?: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  expectedSalary?: number

  @IsOptional()
  @IsString()
  noticePeriod?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  screeningScore?: number

  @IsOptional()
  @IsString()
  screeningNotes?: string

  @IsOptional()
  @IsString()
  screenedBy?: string
}

