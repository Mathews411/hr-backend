import { Module } from '@nestjs/common'
import { DailyAttendanceService } from './daily-attendance.service'
import { DailyAttendanceController } from './daily-attendance.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [DailyAttendanceController],
  providers: [DailyAttendanceService],
  exports: [DailyAttendanceService],
})
export class DailyAttendanceModule {}

