import { IsEnum, IsString, IsOptional } from 'class-validator'
import { LocationAlertStatus } from './create-location-deviation-alert.dto'

export class UpdateLocationDeviationAlertDto {
  @IsOptional()
  @IsEnum(LocationAlertStatus)
  status?: LocationAlertStatus

  @IsOptional()
  @IsString()
  resolvedBy?: string

  @IsOptional()
  @IsString()
  remarks?: string
}

