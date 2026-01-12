import { Module } from '@nestjs/common'
import { PromotionRecommendationsService } from './promotion-recommendations.service'
import { PromotionRecommendationsController } from './promotion-recommendations.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [PromotionRecommendationsController],
  providers: [PromotionRecommendationsService],
  exports: [PromotionRecommendationsService],
})
export class PromotionRecommendationsModule {}

