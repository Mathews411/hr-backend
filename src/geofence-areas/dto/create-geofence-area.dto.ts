import { IsString, IsNumber, IsEnum, IsBoolean, IsOptional, Min, Max } from 'class-validator'

export enum GeofenceType {
  OFFICE = 'OFFICE',
  PROJECT_SITE = 'PROJECT_SITE',
  CLIENT_LOCATION = 'CLIENT_LOCATION',
  OTHER = 'OTHER'
}

export enum GeofenceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export class CreateGeofenceAreaDto {
  @IsString()
  geofenceName: string

  @IsString()
  geofenceCode: string

  @IsString()
  location: string

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number

  @IsNumber()
  @Min(10)
  @Max(10000)
  radius: number

  @IsEnum(GeofenceType)
  type: GeofenceType

  @IsOptional()
  @IsEnum(GeofenceStatus)
  status?: GeofenceStatus

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean
}

