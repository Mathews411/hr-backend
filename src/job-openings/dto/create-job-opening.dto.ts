import { IsString, IsOptional, IsInt, IsEnum, IsDateString, IsNumber, Min, Max } from 'class-validator'

export enum JobEmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
}

export enum JobOpeningStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
}

export class CreateJobOpeningDto {
  @IsString()
  jobTitle: string

  @IsString()
  jobCode: string

  @IsOptional()
  @IsString()
  departmentId?: string

  @IsOptional()
  @IsString()
  designationId?: string

  @IsOptional()
  @IsEnum(JobEmploymentType)
  employmentType?: JobEmploymentType

  @IsString()
  jobLocation: string

  @IsInt()
  @Min(1)
  numberOfOpenings: number

  @IsOptional()
  @IsInt()
  @Min(0)
  minExperience?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  maxExperience?: number

  @IsOptional()
  @IsString()
  education?: string

  @IsOptional()
  @IsString()
  skills?: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  minSalary?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxSalary?: number

  @IsOptional()
  @IsString()
  salaryCurrency?: string

  @IsString()
  jobDescription: string

  @IsString()
  responsibilities: string

  @IsString()
  requirements: string

  @IsOptional()
  @IsString()
  benefits?: string

  @IsOptional()
  @IsDateString()
  postedDate?: string

  @IsOptional()
  @IsDateString()
  closingDate?: string

  @IsOptional()
  @IsEnum(JobOpeningStatus)
  status?: JobOpeningStatus

  @IsOptional()
  @IsString()
  createdBy?: string
}

