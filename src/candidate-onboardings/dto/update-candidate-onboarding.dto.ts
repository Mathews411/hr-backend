import { PartialType } from '@nestjs/mapped-types'
import { CreateCandidateOnboardingDto, OnboardingStatus } from './create-candidate-onboarding.dto'
import { IsOptional, IsEnum, IsDateString } from 'class-validator'

export class UpdateCandidateOnboardingDto extends PartialType(CreateCandidateOnboardingDto) {
  @IsOptional()
  @IsEnum(OnboardingStatus)
  onboardingStatus?: OnboardingStatus

  @IsOptional()
  @IsDateString()
  completedDate?: string
}

