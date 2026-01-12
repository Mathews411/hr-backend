import { Module } from '@nestjs/common'
import { AntiSpoofingAlertsService } from './anti-spoofing-alerts.service'
import { AntiSpoofingAlertsController } from './anti-spoofing-alerts.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [AntiSpoofingAlertsController],
  providers: [AntiSpoofingAlertsService],
  exports: [AntiSpoofingAlertsService],
})
export class AntiSpoofingAlertsModule {}

