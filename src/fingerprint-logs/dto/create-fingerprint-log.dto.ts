import { IsString, IsOptional, IsNumber, IsEnum, Min, Max, IsDateString } from 'class-validator'

export enum FingerprintLogStatus {
  RECOGNIZED = 'RECOGNIZED',
  FAILED = 'FAILED',
  UNKNOWN = 'UNKNOWN',
  DUPLICATE = 'DUPLICATE'
}

export class CreateFingerprintLogDto {
  @IsString()
  fingerprintDeviceId: string

  @IsOptional()
  @IsString()
  employeeMasterId?: string

  @IsOptional()
  @IsDateString()
  recognitionTime?: string

  @IsOptional()
  @IsEnum(FingerprintLogStatus)
  status?: FingerprintLogStatus

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  confidence?: number

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  fingerprintIndex?: number

  @IsOptional()
  @IsString()
  location?: string

  @IsOptional()
  @IsString()
  remarks?: string
}

