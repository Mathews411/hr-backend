import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator'

export enum TargetAudience {
  ALL_EMPLOYEES = 'ALL_EMPLOYEES',
  DEPARTMENT = 'DEPARTMENT',
  DESIGNATION = 'DESIGNATION',
  PROJECT = 'PROJECT',
  INDIVIDUAL = 'INDIVIDUAL',
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class CreatePushNotificationDto {
  @IsString()
  title: string

  @IsString()
  message: string

  @IsEnum(TargetAudience)
  targetAudience: TargetAudience

  @IsOptional()
  @IsString()
  targetDetails?: string

  @IsEnum(NotificationPriority)
  priority: NotificationPriority

  @IsOptional()
  @IsDateString()
  scheduledDate?: string
}

