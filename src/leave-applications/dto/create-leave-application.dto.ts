import { IsString, IsDateString, IsOptional } from 'class-validator'

export class CreateLeaveApplicationDto {
  @IsString()
  employeeMasterId: string

  @IsString()
  leavePolicyId: string

  @IsDateString()
  startDate: string

  @IsDateString()
  endDate: string

  @IsString()
  reason: string
}

