import { Module } from '@nestjs/common'
import { AttendanceLogsService } from './attendance-logs.service'
import { AttendanceLogsController } from './attendance-logs.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [AttendanceLogsController],
  providers: [AttendanceLogsService],
  exports: [AttendanceLogsService],
})
export class AttendanceLogsModule {}

