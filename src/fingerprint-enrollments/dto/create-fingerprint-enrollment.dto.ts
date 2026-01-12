import { IsString, IsOptional, IsNumber, IsEnum, Min, Max } from 'class-validator'

export enum FingerprintEnrollmentStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export class CreateFingerprintEnrollmentDto {
  @IsString()
  employeeMasterId: string

  @IsString()
  fingerprintDeviceId: string

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  fingerprintIndex?: number // Which finger (1-10)

  @IsOptional()
  @IsEnum(FingerprintEnrollmentStatus)
  status?: FingerprintEnrollmentStatus
}

