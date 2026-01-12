import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, Min, Max } from 'class-validator'

export enum AntiSpoofingAlertType {
  PHOTO_DETECTION = 'PHOTO_DETECTION',
  VIDEO_REPLAY = 'VIDEO_REPLAY',
  MASK_DETECTION = 'MASK_DETECTION',
  MODEL_3D = 'MODEL_3D',
  LIVENESS_FAILURE = 'LIVENESS_FAILURE'
}

export enum AntiSpoofingSeverity {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum AntiSpoofingAlertStatus {
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED',
  FALSE_POSITIVE = 'FALSE_POSITIVE'
}

export class CreateAntiSpoofingAlertDto {
  @IsOptional()
  @IsString()
  employeeMasterId?: string

  @IsString()
  cameraDeviceId: string

  @IsOptional()
  @IsDateString()
  alertTime?: string

  @IsEnum(AntiSpoofingAlertType)
  alertType: AntiSpoofingAlertType

  @IsEnum(AntiSpoofingSeverity)
  severity: AntiSpoofingSeverity

  @IsOptional()
  @IsEnum(AntiSpoofingAlertStatus)
  status?: AntiSpoofingAlertStatus

  @IsNumber()
  @Min(0)
  @Max(100)
  confidence: number

  @IsOptional()
  @IsString()
  imageUrl?: string

  @IsOptional()
  @IsString()
  location?: string

  @IsString()
  description: string

  @IsOptional()
  @IsString()
  remarks?: string
}

