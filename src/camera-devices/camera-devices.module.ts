import { Module } from '@nestjs/common'
import { CameraDevicesService } from './camera-devices.service'
import { CameraDevicesController } from './camera-devices.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [CameraDevicesController],
  providers: [CameraDevicesService],
  exports: [CameraDevicesService],
})
export class CameraDevicesModule {}

