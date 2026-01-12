import { IsString, IsDateString, IsNumber, IsOptional } from 'class-validator'

export class CreateLeaveDeductionDto {
  @IsString()
  employeeMasterId: string

  @IsString()
  leaveType: string

  @IsDateString()
  date: string

  @IsNumber()
  daysDeducted: number

  @IsString()
  reason: string

  @IsOptional()
  @IsString()
  approvedBy?: string
}

