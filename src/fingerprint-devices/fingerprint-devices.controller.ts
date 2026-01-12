import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common'
import { FingerprintDevicesService } from './fingerprint-devices.service'
import { FingerprintDeviceMonitorService } from './fingerprint-device-monitor.service'
import { CreateFingerprintDeviceDto } from './dto/create-fingerprint-device.dto'
import { UpdateFingerprintDeviceDto } from './dto/update-fingerprint-device.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('fingerprint-devices')
@UseGuards(JwtAuthGuard)
export class FingerprintDevicesController {
  constructor(
    private readonly service: FingerprintDevicesService,
    private readonly monitorService: FingerprintDeviceMonitorService,
  ) {}

  @Post()
  create(@Body() createDto: CreateFingerprintDeviceDto) {
    return this.service.create(createDto)
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(status, search)
  }

  @Get('device/:deviceId')
  findByDeviceId(@Param('deviceId') deviceId: string) {
    return this.service.findByDeviceId(deviceId)
  }

  @Get('serial/:serialNumber')
  findBySerialNumber(@Param('serialNumber') serialNumber: string) {
    return this.service.findBySerialNumber(serialNumber)
  }

  @Post('sync/all')
  syncAllDevices() {
    return this.monitorService.syncAllDevices()
  }

  @Get('monitor/status')
  getMonitorStatus() {
    return this.monitorService.getStatus()
  }

  @Post(':id/test-connection')
  async testConnection(@Param('id') id: string) {
    const device = await this.service.findOne(id)
    
    try {
      // Try to connect to device
      const monitorService = this.monitorService as any
      const result = await monitorService.syncDevice(id)
      
      return {
        success: result.success,
        message: result.success 
          ? `Successfully connected to device at ${device.ipAddress}:${device.port}`
          : `Connection failed: ${result.error}`,
        device: {
          ipAddress: device.ipAddress,
          port: device.port,
          status: device.status,
        }
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Connection test failed: ${error.message}`,
        device: {
          ipAddress: device.ipAddress,
          port: device.port,
          status: device.status,
        }
      }
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateFingerprintDeviceDto) {
    return this.service.update(id, updateDto)
  }

  @Patch(':id/toggle-status')
  toggleStatus(@Param('id') id: string) {
    return this.service.toggleStatus(id)
  }

  @Post(':id/sync')
  syncDevice(@Param('id') id: string) {
    return this.monitorService.manualSync(id)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}

