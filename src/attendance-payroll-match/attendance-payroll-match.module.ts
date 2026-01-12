import { Module } from '@nestjs/common'
import { AttendancePayrollMatchService } from './attendance-payroll-match.service'
import { AttendancePayrollMatchController } from './attendance-payroll-match.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [AttendancePayrollMatchController],
  providers: [AttendancePayrollMatchService],
  exports: [AttendancePayrollMatchService],
})
export class AttendancePayrollMatchModule {}

