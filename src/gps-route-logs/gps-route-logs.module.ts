import { Module } from '@nestjs/common'
import { GPSRouteLogsService } from './gps-route-logs.service'
import { GPSRouteLogsController } from './gps-route-logs.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [GPSRouteLogsController],
  providers: [GPSRouteLogsService],
  exports: [GPSRouteLogsService],
})
export class GPSRouteLogsModule {}

