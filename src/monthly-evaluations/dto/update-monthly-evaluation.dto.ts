import { PartialType } from '@nestjs/mapped-types'
import { CreateMonthlyEvaluationDto } from './create-monthly-evaluation.dto'
import { IsOptional, IsDateString } from 'class-validator'

export class UpdateMonthlyEvaluationDto extends PartialType(CreateMonthlyEvaluationDto) {
  @IsOptional()
  @IsDateString()
  evaluatedDate?: string

  @IsOptional()
  @IsDateString()
  approvedDate?: string
}

