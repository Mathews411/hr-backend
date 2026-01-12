import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator'

export class CreateLeavePolicyDto {
  @IsString()
  leaveType: string

  @IsString()
  leaveCode: string

  @IsInt()
  @Min(0)
  entitlement: number // days per year

  @IsOptional()
  @IsBoolean()
  carryForward?: boolean

  @IsOptional()
  @IsInt()
  @Min(0)
  maxCarryForward?: number

  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean

  @IsString()
  applicableTo: string

  @IsString()
  description: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsInt()
  @Min(0)
  minDaysNotice?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  maxConsecutiveDays?: number
}

