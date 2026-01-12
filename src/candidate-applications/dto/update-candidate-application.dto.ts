import { PartialType } from '@nestjs/mapped-types'
import { CreateCandidateApplicationDto, CandidateApplicationStatus } from './create-candidate-application.dto'
import { IsOptional, IsEnum, IsDateString } from 'class-validator'

export class UpdateCandidateApplicationDto extends PartialType(CreateCandidateApplicationDto) {
  @IsOptional()
  @IsEnum(CandidateApplicationStatus)
  status?: CandidateApplicationStatus

  @IsOptional()
  @IsDateString()
  screenedDate?: string
}

