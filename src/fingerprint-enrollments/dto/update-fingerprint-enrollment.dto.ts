import { PartialType } from '@nestjs/mapped-types'
import { CreateFingerprintEnrollmentDto, FingerprintEnrollmentStatus } from './create-fingerprint-enrollment.dto'
import { IsOptional, IsString, IsNumber, IsEnum, Min, Max } from 'class-validator'

export class UpdateFingerprintEnrollmentDto extends PartialType(CreateFingerprintEnrollmentDto) {
  @IsOptional()
  @IsEnum(FingerprintEnrollmentStatus)
  status?: FingerprintEnrollmentStatus

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  qualityScore?: number

  @IsOptional()
  @IsString()
  fingerprintTemplate?: string // Encrypted template data
}

