import { Module } from '@nestjs/common'
import { KpiAssignmentsService } from './kpi-assignments.service'
import { KpiAssignmentsController } from './kpi-assignments.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [KpiAssignmentsController],
  providers: [KpiAssignmentsService],
  exports: [KpiAssignmentsService],
})
export class KpiAssignmentsModule {}

