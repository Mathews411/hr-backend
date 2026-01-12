import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, Min, Max } from 'class-validator'

export enum FingerprintValidationAlertType {
  LOW_QUALITY = 'LOW_QUALITY',
  TEMPLATE_MISMATCH = 'TEMPLATE_MISMATCH',
  DUPLICATE_ENROLLMENT = 'DUPLICATE_ENROLLMENT',
  DEVICE_ERROR = 'DEVICE_ERROR',
  COMMUNICATION_FAILURE = 'COMMUNICATION_FAILURE'
}

export enum FingerprintValidationSeverity {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum FingerprintValidationAlertStatus {
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED',
  FALSE_POSITIVE = 'FALSE_POSITIVE'
}

export class CreateFingerprintValidationAlertDto {
  @IsOptional()
  @IsString()
  employeeMasterId?: string

  @IsString()
  fingerprintDeviceId: string

  @IsOptional()
  @IsDateString()
  alertTime?: string

  @IsEnum(FingerprintValidationAlertType)
  alertType: FingerprintValidationAlertType

  @IsEnum(FingerprintValidationSeverity)
  severity: FingerprintValidationSeverity

  @IsOptional()
  @IsEnum(FingerprintValidationAlertStatus)
  status?: FingerprintValidationAlertStatus

  @IsNumber()
  @Min(0)
  @Max(100)
  confidence: number

  @IsOptional()
  @IsString()
  location?: string

  @IsString()
  description: string

  @IsOptional()
  @IsString()
  remarks?: string
}

