import { IsEnum, IsOptional } from 'class-validator'
import { GeofenceAssignmentStatus } from './create-geofence-project-assignment.dto'

export class UpdateGeofenceProjectAssignmentDto {
  @IsOptional()
  @IsEnum(GeofenceAssignmentStatus)
  status?: GeofenceAssignmentStatus
}

