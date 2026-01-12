import { Module } from '@nestjs/common'
import { ManagerReviewsService } from './manager-reviews.service'
import { ManagerReviewsController } from './manager-reviews.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [ManagerReviewsController],
  providers: [ManagerReviewsService],
  exports: [ManagerReviewsService],
})
export class ManagerReviewsModule {}

