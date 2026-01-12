import { PartialType } from '@nestjs/mapped-types'
import { CreateFingerprintValidationAlertDto, FingerprintValidationAlertStatus } from './create-fingerprint-validation-alert.dto'
import { IsOptional, IsEnum, IsString } from 'class-validator'

export class UpdateFingerprintValidationAlertDto extends PartialType(CreateFingerprintValidationAlertDto) {
  @IsOptional()
  @IsEnum(FingerprintValidationAlertStatus)
  status?: FingerprintValidationAlertStatus

  @IsOptional()
  @IsString()
  remarks?: string
}

