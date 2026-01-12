import { PartialType } from '@nestjs/mapped-types'
import { CreateSelfReviewDto } from './create-self-review.dto'
import { IsOptional, IsDateString } from 'class-validator'

export class UpdateSelfReviewDto extends PartialType(CreateSelfReviewDto) {
  @IsOptional()
  @IsDateString()
  reviewedDate?: string
}

