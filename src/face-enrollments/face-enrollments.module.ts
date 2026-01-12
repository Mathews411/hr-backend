import { Module } from '@nestjs/common'
import { FaceEnrollmentsService } from './face-enrollments.service'
import { FaceEnrollmentsController } from './face-enrollments.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [FaceEnrollmentsController],
  providers: [FaceEnrollmentsService],
  exports: [FaceEnrollmentsService],
})
export class FaceEnrollmentsModule {}

