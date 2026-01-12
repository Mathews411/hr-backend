import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, Min, Max, Matches } from 'class-validator'

export enum CameraDeviceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OFFLINE = 'OFFLINE'
}

export class CreateCameraDeviceDto {
  @IsString()
  deviceName: string

  @IsString()
  deviceId: string

  @IsString()
  location: string

  @IsString()
  @Matches(/^(\d{1,3}\.){3}\d{1,3}$/, { message: 'Invalid IP address format' })
  ipAddress: string

  @IsNumber()
  @Min(1)
  @Max(65535)
  port: number

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

