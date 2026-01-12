import { IsString, IsDateString, IsOptional, IsNumber } from 'class-validator'

export class CreateNightShiftAllowanceDto {
  @IsString()
  employeeMasterId: string

  @IsDateString()
  date: string

  @IsString()
  shiftStartTime: string

  @IsString()
  shiftEndTime: string

  @IsOptional()
  @IsNumber()
  hoursWorked?: number

  @IsOptional()
  @IsNumber()
  allowanceAmount?: number
}

