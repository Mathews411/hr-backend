import { IsString, IsInt, IsOptional, Min } from 'class-validator'

export class UpdateLeaveBalanceDto {
  @IsOptional()
  @IsString()
  employeeMasterId?: string

  @IsOptional()
  @IsString()
  leavePolicyId?: string

  @IsOptional()
  @IsInt()
  @Min(2000)
  year?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  totalAllocated?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  used?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  carryForward?: number
}

