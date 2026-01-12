import { Module } from '@nestjs/common'
import { GeofenceAreasService } from './geofence-areas.service'
import { GeofenceAreasController } from './geofence-areas.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [GeofenceAreasController],
  providers: [GeofenceAreasService],
  exports: [GeofenceAreasService],
})
export class GeofenceAreasModule {}

