import { IsString, IsDateString, IsOptional, IsNumber, IsEnum } from 'class-validator'

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  HALF_DAY = 'HALF_DAY',
  ON_LEAVE = 'ON_LEAVE',
  HOLIDAY = 'HOLIDAY',
}

export class CreateDailyAttendanceDto {
  @IsString()
  employeeMasterId: string

  @IsDateString()
  date: string

  @IsOptional()
  @IsString()
  checkIn?: string

  @IsOptional()
  @IsString()
  checkOut?: string

  @IsOptional()
  @IsNumber()
  workingHours?: number

  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus

  @IsOptional()
  @IsString()
  location?: string

  @IsOptional()
  @IsString()
  remarks?: string
}

