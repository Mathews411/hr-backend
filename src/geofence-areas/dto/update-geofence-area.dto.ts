import { IsString, IsNumber, IsEnum, IsBoolean, IsOptional, Min, Max } from 'class-validator'
import { GeofenceType, GeofenceStatus } from './create-geofence-area.dto'

export class UpdateGeofenceAreaDto {
  @IsOptional()
  @IsString()
  geofenceName?: string

  @IsOptional()
  @IsString()
  geofenceCode?: string

  @IsOptional()
  @IsString()
  location?: string

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number

  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(10000)
  radius?: number

  @IsOptional()
  @IsEnum(GeofenceType)
  type?: GeofenceType

  @IsOptional()
  @IsEnum(GeofenceStatus)
  status?: GeofenceStatus

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean
}

