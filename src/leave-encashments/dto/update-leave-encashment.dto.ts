import { IsEnum, IsOptional, IsString } from 'class-validator'
import { LeaveEncashmentStatus } from '@prisma/client'

export class UpdateLeaveEncashmentDto {
  @IsOptional()
  @IsEnum(LeaveEncashmentStatus)
  status?: LeaveEncashmentStatus

  @IsOptional()
  @IsString()
  rejectionReason?: string

  @IsOptional()
  @IsString()
  approvedBy?: string
}

