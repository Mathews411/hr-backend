import { IsString, IsDateString, IsOptional } from 'class-validator'

export class CreateAttendanceRegularizationDto {
  @IsString()
  employeeMasterId: string

  @IsDateString()
  date: string

  @IsOptional()
  @IsString()
  originalCheckIn?: string

  @IsOptional()
  @IsString()
  originalCheckOut?: string

  @IsString()
  requestedCheckIn: string

  @IsString()
  requestedCheckOut: string

  @IsString()
  reason: string

  @IsOptional()
  @IsString()
  supportingDocument?: string
}

