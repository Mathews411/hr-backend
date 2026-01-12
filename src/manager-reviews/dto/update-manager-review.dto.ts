import { PartialType } from '@nestjs/mapped-types'
import { CreateManagerReviewDto } from './create-manager-review.dto'
import { IsOptional, IsDateString } from 'class-validator'

export class UpdateManagerReviewDto extends PartialType(CreateManagerReviewDto) {
  @IsOptional()
  @IsDateString()
  approvedDate?: string
}

