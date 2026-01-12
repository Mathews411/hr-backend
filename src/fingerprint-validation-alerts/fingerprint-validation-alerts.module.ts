import { Module } from '@nestjs/common'
import { FingerprintValidationAlertsService } from './fingerprint-validation-alerts.service'
import { FingerprintValidationAlertsController } from './fingerprint-validation-alerts.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [FingerprintValidationAlertsController],
  providers: [FingerprintValidationAlertsService],
  exports: [FingerprintValidationAlertsService],
})
export class FingerprintValidationAlertsModule {}

