import { IsString, IsEnum, IsOptional } from 'class-validator'

export enum GeofenceAssignmentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export class CreateGeofenceProjectAssignmentDto {
  @IsString()
  projectId: string

  @IsString()
  geofenceAreaId: string

  @IsOptional()
  @IsString()
  assignedBy?: string

  @IsOptional()
  @IsEnum(GeofenceAssignmentStatus)
  status?: GeofenceAssignmentStatus
}

