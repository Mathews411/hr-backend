import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, Min, Max, Matches } from 'class-validator'
import { PartialType } from '@nestjs/mapped-types'
import { CreateCameraDeviceDto, CameraDeviceStatus } from './create-camera-device.dto'

export class UpdateCameraDeviceDto extends PartialType(CreateCameraDeviceDto) {
  @IsOptional()
  @IsString()
  deviceName?: string

  @IsOptional()
  @IsString()
  deviceId?: string

  @IsOptional()
  @IsString()
  location?: string

  @IsOptional()
  @IsString()
  @Matches(/^(\d{1,3}\.){3}\d{1,3}$/, { message: 'Invalid IP address format' })
  ipAddress?: string

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(65535)
  port?: number

  @IsOptional()
  @IsEnum(CameraDeviceStatus)
  status?: CameraDeviceStatus

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  recognitionAccuracy?: number

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean

  @IsOptional()
  @IsString()
  model?: string

  @IsOptional()
  @IsString()
  firmwareVersion?: string
}

