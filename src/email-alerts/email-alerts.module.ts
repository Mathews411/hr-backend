import { Module } from '@nestjs/common'
import { EmailAlertsService } from './email-alerts.service'
import { EmailAlertsController } from './email-alerts.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [EmailAlertsController],
  providers: [EmailAlertsService],
  exports: [EmailAlertsService],
})
export class EmailAlertsModule {}

