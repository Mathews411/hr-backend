import { Module } from '@nestjs/common'
import { FingerprintEnrollmentsService } from './fingerprint-enrollments.service'
import { FingerprintEnrollmentsController } from './fingerprint-enrollments.controller'
import { PrismaModule } from '../prisma/prisma.module'
import { FingerprintDevicesModule } from '../fingerprint-devices/fingerprint-devices.module'

@Module({
  imports: [PrismaModule, FingerprintDevicesModule],
  controllers: [FingerprintEnrollmentsController],
  providers: [FingerprintEnrollmentsService],
  exports: [FingerprintEnrollmentsService],
})
export class FingerprintEnrollmentsModule {}

