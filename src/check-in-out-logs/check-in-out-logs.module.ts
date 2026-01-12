import { Module } from '@nestjs/common'
import { CheckInOutLogsService } from './check-in-out-logs.service'
import { CheckInOutLogsController } from './check-in-out-logs.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [CheckInOutLogsController],
  providers: [CheckInOutLogsService],
  exports: [CheckInOutLogsService],
})
export class CheckInOutLogsModule {}

