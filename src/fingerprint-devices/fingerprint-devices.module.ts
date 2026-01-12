import { Module } from '@nestjs/common'
import { FingerprintDevicesService } from './fingerprint-devices.service'
import { FingerprintDevicesController } from './fingerprint-devices.controller'
import { ZKFingerSDKWrapperService } from './zkfinger-sdk-wrapper.service'
import { FingerprintDeviceMonitorService } from './fingerprint-device-monitor.service'
import { PrismaModule } from '../prisma/prisma.module'
import { FingerprintLogsModule } from '../fingerprint-logs/fingerprint-logs.module'

@Module({
  imports: [PrismaModule, FingerprintLogsModule],
  controllers: [FingerprintDevicesController],
  providers: [
    FingerprintDevicesService,
    ZKFingerSDKWrapperService,
    FingerprintDeviceMonitorService,
  ],
  exports: [
    FingerprintDevicesService,
    ZKFingerSDKWrapperService,
    FingerprintDeviceMonitorService,
  ],
})
export class FingerprintDevicesModule {}

