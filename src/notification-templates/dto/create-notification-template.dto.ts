import { IsString, IsEnum, IsOptional, IsArray, IsBoolean } from 'class-validator'

export enum NotificationType {
  PUSH = 'PUSH',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
}

export enum NotificationCategory {
  ATTENDANCE = 'ATTENDANCE',
  LEAVE = 'LEAVE',
  PAYROLL = 'PAYROLL',
  PERFORMANCE = 'PERFORMANCE',
  REMINDER = 'REMINDER',
  GENERAL = 'GENERAL',
}

export class CreateNotificationTemplateDto {
  @IsString()
  templateName: string

  @IsString()
  templateCode: string

  @IsEnum(NotificationType)
  notificationType: NotificationType

  @IsOptional()
  @IsString()
  subject?: string

  @IsString()
  message: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[]

  @IsEnum(NotificationCategory)
  category: NotificationCategory

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

