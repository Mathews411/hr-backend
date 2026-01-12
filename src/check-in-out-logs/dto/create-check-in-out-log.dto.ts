import { IsString, IsDateString, IsOptional, IsNumber, IsEnum } from 'class-validator'

export enum CheckInMethod {
  BIOMETRIC = 'BIOMETRIC',
  RFID = 'RFID',
  MOBILE_APP = 'MOBILE_APP',
  MANUAL = 'MANUAL',
}

export enum CheckInOutStatus {
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
  INCOMPLETE = 'INCOMPLETE',
}

export class CreateCheckInOutLogDto {
  @IsString()
  employeeMasterId: string

  @IsDateString()
  logDate: string

  @IsOptional()
  @IsString()
  checkInTime?: string

  @IsOptional()
  @IsString()
  checkOutTime?: string

  @IsOptional()
  @IsString()
  checkInLocation?: string

  @IsOptional()
  @IsString()
  checkOutLocation?: string

  @IsEnum(CheckInMethod)
  checkInMethod: CheckInMethod

  @IsOptional()
  @IsEnum(CheckInMethod)
  checkOutMethod?: CheckInMethod

  @IsOptional()
  @IsNumber()
  workingHours?: number

  @IsOptional()
  @IsEnum(CheckInOutStatus)
  status?: CheckInOutStatus
}

