import { Module } from '@nestjs/common'
import { EmployeeAssignmentsService } from './employee-assignments.service'
import { EmployeeAssignmentsController } from './employee-assignments.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [EmployeeAssignmentsController],
  providers: [EmployeeAssignmentsService],
  exports: [EmployeeAssignmentsService],
})
export class EmployeeAssignmentsModule {}
