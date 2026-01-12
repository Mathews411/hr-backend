import { Module } from '@nestjs/common'
import { GPSPunchesService } from './gps-punches.service'
import { GPSPunchesController } from './gps-punches.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [GPSPunchesController],
  providers: [GPSPunchesService],
  exports: [GPSPunchesService],
})
export class GPSPunchesModule {}

