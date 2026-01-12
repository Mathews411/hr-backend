import { Module } from '@nestjs/common'
import { SMSAlertsService } from './sms-alerts.service'
import { SMSAlertsController } from './sms-alerts.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [SMSAlertsController],
  providers: [SMSAlertsService],
  exports: [SMSAlertsService],
})
export class SMSAlertsModule {}

