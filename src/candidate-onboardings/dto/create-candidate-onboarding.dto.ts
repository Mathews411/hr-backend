import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, IsUUID, Min, Max } from 'class-validator'

export enum OnboardingStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
}

export class CreateCandidateOnboardingDto {
  @IsUUID()
  candidateApplicationId: string

  @IsDateString()
  offerAcceptedDate: string

  @IsDateString()
  joiningDate: string

  @IsOptional()
  @IsString()
  employeeId?: string

  @IsOptional()
  @IsString()
  employeeCode?: string

  @IsOptional()
  @IsEnum(OnboardingStatus)
  onboardingStatus?: OnboardingStatus

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  currentStep?: number

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  totalSteps?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  documentsSubmitted?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalDocuments?: number

  @IsOptional()
  @IsString()
  notes?: string
}

