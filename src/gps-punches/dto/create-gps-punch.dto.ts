import { IsString, IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator'

export enum GPSPunchType {
  IN = 'IN',
  OUT = 'OUT'
}

export enum GPSPunchStatus {
  VALID = 'VALID',
  INVALID = 'INVALID',
  OUTSIDE_GEOFENCE = 'OUTSIDE_GEOFENCE'
}

export class CreateGPSPunchDto {
  @IsString()
  employeeMasterId: string

  @IsOptional()
  @IsString()
  projectId?: string

  @IsOptional()
  @IsString()
  geofenceAreaId?: string

  @IsEnum(GPSPunchType)
  punchType: GPSPunchType

  @IsOptional()
  punchTime?: string

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number

  @IsString()
  location: string

  @IsOptional()
  @IsNumber()
  distance?: number

  @IsEnum(GPSPunchStatus)
  status: GPSPunchStatus

  @IsOptional()
  @IsNumber()
  @Min(0)
  accuracy?: number
}

