import { IsString, IsInt, IsOptional, Min } from 'class-validator'

export class CreateLeaveBalanceDto {
  @IsString()
  employeeMasterId: string

  @IsString()
  leavePolicyId: string

  @IsInt()
  @Min(2000)
  year: number

  @IsInt()
  @Min(0)
  totalAllocated: number

  @IsOptional()
  @IsInt()
  @Min(0)
  used?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  carryForward?: number
}

