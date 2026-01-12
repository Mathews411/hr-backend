import { IsString, IsDateString, IsOptional, IsNumber, IsEnum } from 'class-validator'

export enum OvertimeType {
  WEEKDAY = 'WEEKDAY',
  WEEKEND = 'WEEKEND',
  HOLIDAY = 'HOLIDAY',
}

export enum OvertimeStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class CreateOvertimeRecordDto {
  @IsString()
  employeeMasterId: string

  @IsDateString()
  date: string

  @IsString()
  startTime: string

  @IsString()
  endTime: string

  @IsNumber()
  totalHours: number

  @IsEnum(OvertimeType)
  overtimeType: OvertimeType

  @IsString()
  reason: string

  @IsOptional()
  @IsString()
  projectId?: string
}

