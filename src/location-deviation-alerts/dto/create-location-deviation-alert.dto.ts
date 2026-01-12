import { IsString, IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator'

export enum LocationAlertType {
  OUTSIDE_GEOFENCE = 'OUTSIDE_GEOFENCE',
  NO_GPS_SIGNAL = 'NO_GPS_SIGNAL',
  LOCATION_MISMATCH = 'LOCATION_MISMATCH',
  ROUTE_DEVIATION = 'ROUTE_DEVIATION'
}

export enum LocationAlertSeverity {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum LocationAlertStatus {
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED',
  FALSE_POSITIVE = 'FALSE_POSITIVE'
}

export class CreateLocationDeviationAlertDto {
  @IsString()
  employeeMasterId: string

  @IsOptional()
  @IsString()
  projectId?: string

  @IsOptional()
  @IsString()
  geofenceAreaId?: string

  @IsOptional()
  alertTime?: string

  @IsEnum(LocationAlertType)
  alertType: LocationAlertType

  @IsEnum(LocationAlertSeverity)
  severity: LocationAlertSeverity

  @IsOptional()
  @IsEnum(LocationAlertStatus)
  status?: LocationAlertStatus

  @IsNumber()
  @Min(-90)
  @Max(90)
  currentLatitude: number

  @IsNumber()
  @Min(-180)
  @Max(180)
  currentLongitude: number

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  expectedLatitude?: number

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  expectedLongitude?: number

  @IsNumber()
  @Min(0)
  deviationDistance: number

  @IsString()
  description: string

  @IsOptional()
  @IsString()
  remarks?: string
}

