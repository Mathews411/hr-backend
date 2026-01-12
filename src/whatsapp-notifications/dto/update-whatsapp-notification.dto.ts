import { PartialType } from '@nestjs/mapped-types'
import { CreateWhatsAppNotificationDto } from './create-whatsapp-notification.dto'

export class UpdateWhatsAppNotificationDto extends PartialType(CreateWhatsAppNotificationDto) {}

