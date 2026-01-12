import { IsString, IsInt, Min } from 'class-validator'

export class CreateLeaveEncashmentDto {
  @IsString()
  employeeMasterId: string

  @IsString()
  leavePolicyId: string

  @IsInt()
  @Min(1)
  daysToEncash: number
}

