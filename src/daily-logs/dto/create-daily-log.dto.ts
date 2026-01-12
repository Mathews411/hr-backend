import { IsString, IsNumber, IsDateString, IsEnum, IsOptional, Min, Max } from 'class-validator'
import { DailyLogStatus } from '@prisma/client'

export class CreateDailyLogDto {
  @IsString()
  projectId: string

  @IsString()
  employeeId: string

  @IsDateString()
  logDate: string

  @IsNumber()
  @Min(0.5)
  @Max(24)
  hoursWorked: number

  @IsString()
  taskDescription: string

  @IsString()
  activityType: string

  @IsOptional()
  @IsEnum(DailyLogStatus)
  status?: DailyLogStatus

  @IsOptional()
  @IsString()
  notes?: string
}

