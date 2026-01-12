import { IsString, IsDateString, IsOptional, IsEnum } from 'class-validator'

export enum LeaveApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export class UpdateLeaveApplicationDto {
  @IsOptional()
  @IsString()
  employeeMasterId?: string

  @IsOptional()
  @IsString()
  leavePolicyId?: string

  @IsOptional()
  @IsDateString()
  startDate?: string

  @IsOptional()
  @IsDateString()
  endDate?: string

  @IsOptional()
  @IsString()
  reason?: string

  @IsOptional()
  @IsEnum(LeaveApplicationStatus)
  status?: LeaveApplicationStatus

  @IsOptional()
  @IsString()
  rejectionReason?: string
}

