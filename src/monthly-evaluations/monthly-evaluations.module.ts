import { Module } from '@nestjs/common'
import { MonthlyEvaluationsService } from './monthly-evaluations.service'
import { MonthlyEvaluationsController } from './monthly-evaluations.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [MonthlyEvaluationsController],
  providers: [MonthlyEvaluationsService],
  exports: [MonthlyEvaluationsService],
})
export class MonthlyEvaluationsModule {}

