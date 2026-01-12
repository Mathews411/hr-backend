import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator'

export class EnrollFingerprintDto {
  // enrollmentId comes from URL parameter, not body
  @IsOptional()
  @IsString()
  enrollmentId?: string

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  fingerprintIndex?: number // Which finger to enroll (1-10)

  @IsOptional()
  @IsString()
  fingerprintTemplate?: string // Template data from device
}

