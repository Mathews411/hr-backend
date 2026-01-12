import { PartialType } from '@nestjs/mapped-types'
import { CreatePromotionRecommendationDto } from './create-promotion-recommendation.dto'
import { IsOptional, IsDateString, IsString } from 'class-validator'

export class UpdatePromotionRecommendationDto extends PartialType(CreatePromotionRecommendationDto) {
  @IsOptional()
  @IsDateString()
  approvedDate?: string

  @IsOptional()
  @IsString()
  rejectionReason?: string
}

