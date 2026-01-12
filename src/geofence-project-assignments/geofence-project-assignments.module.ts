import { Module } from '@nestjs/common'
import { GeofenceProjectAssignmentsService } from './geofence-project-assignments.service'
import { GeofenceProjectAssignmentsController } from './geofence-project-assignments.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [GeofenceProjectAssignmentsController],
  providers: [GeofenceProjectAssignmentsService],
  exports: [GeofenceProjectAssignmentsService],
})
export class GeofenceProjectAssignmentsModule {}

