import { Module } from '@nestjs/common'
import { SelfReviewsService } from './self-reviews.service'
import { SelfReviewsController } from './self-reviews.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [SelfReviewsController],
  providers: [SelfReviewsService],
  exports: [SelfReviewsService],
})
export class SelfReviewsModule {}

