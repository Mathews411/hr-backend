import { PartialType } from '@nestjs/mapped-types'
import { CreateInterviewDto, InterviewStatus } from './create-interview.dto'
import { IsOptional, IsEnum, IsDateString } from 'class-validator'

export class UpdateInterviewDto extends PartialType(CreateInterviewDto) {
  @IsOptional()
  @IsEnum(InterviewStatus)
  status?: InterviewStatus

  @IsOptional()
  @IsDateString()
  interviewDate?: string
}

