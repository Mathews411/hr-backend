import { IsString, IsDateString, IsEnum, IsOptional } from 'class-validator'
import { ManagerAssignmentStatus } from '@prisma/client'

export class CreateManagerAssignmentDto {
  @IsString()
  userId: string

  @IsString()
  projectId: string

  @IsDateString()
  startDate: string

  @IsOptional()
  @IsDateString()
  endDate?: string

  @IsOptional()
  @IsEnum(ManagerAssignmentStatus)
  status?: ManagerAssignmentStatus

  @IsOptional()
  @IsString()
  assignedBy?: string

  @IsOptional()
  @IsString()
  previousManagerId?: string
}

