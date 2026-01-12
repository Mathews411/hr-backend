import { PartialType } from '@nestjs/mapped-types'
import { CreateAppraisalCycleDto } from './create-appraisal-cycle.dto'
import { IsOptional, IsNumber } from 'class-validator'
import { Type } from 'class-transformer'

export class UpdateAppraisalCycleDto extends PartialType(CreateAppraisalCycleDto) {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  totalEmployees?: number

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  completedEvaluations?: number

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pendingEvaluations?: number
}

