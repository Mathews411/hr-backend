import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, Min, Max, Matches } from 'class-validator'

export enum FingerprintDeviceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OFFLINE = 'OFFLINE'
}

export class CreateFingerprintDeviceDto {
  @IsString()
  deviceName: string

  @IsString()
  deviceId: string

  @IsString()
  serialNumber: string

  @IsString()
  @Matches(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, { message: 'Invalid MAC address format' })
  macAddress: string

  @IsString()
  location: string

  @IsString()
  @Matches(/^(\d{1,3}\.){3}\d{1,3}$/, { message: 'Invalid IP address format' })
  ipAddress: string

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(65535)
  port?: number

  @IsOptional()
  @IsEnum(FingerprintDeviceStatus)
  status?: FingerprintDeviceStatus

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

  @IsOptional()
  @IsString()
  algorithm?: string // e.g., "ZKFinger VX10.0"

  @IsOptional()
  @IsString()
  platform?: string // e.g., "ZLM60_TFT"
}

