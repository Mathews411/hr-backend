import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, Min, Max } from 'class-validator'
import { PartialType } from '@nestjs/mapped-types'
import { CreateAntiSpoofingAlertDto, AntiSpoofingAlertType, AntiSpoofingSeverity, AntiSpoofingAlertStatus } from './create-anti-spoofing-alert.dto'

export class UpdateAntiSpoofingAlertDto extends PartialType(CreateAntiSpoofingAlertDto) {
  @IsOptional()
  @IsEnum(AntiSpoofingAlertStatus)
  status?: AntiSpoofingAlertStatus

  @IsOptional()
  @IsString()
  remarks?: string

  @IsOptional()
  @IsString()
  resolvedBy?: string
}

