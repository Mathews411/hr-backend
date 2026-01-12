import { Module } from '@nestjs/common'
import { WhatsAppNotificationsService } from './whatsapp-notifications.service'
import { WhatsAppNotificationsController } from './whatsapp-notifications.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [WhatsAppNotificationsController],
  providers: [WhatsAppNotificationsService],
  exports: [WhatsAppNotificationsService],
})
export class WhatsAppNotificationsModule {}

