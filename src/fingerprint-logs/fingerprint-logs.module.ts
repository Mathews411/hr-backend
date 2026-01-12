import { Module } from '@nestjs/common'
import { FingerprintLogsService } from './fingerprint-logs.service'
import { FingerprintLogsController } from './fingerprint-logs.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [FingerprintLogsController],
  providers: [FingerprintLogsService],
  exports: [FingerprintLogsService],
})
export class FingerprintLogsModule {}

