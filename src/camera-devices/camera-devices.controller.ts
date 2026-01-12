import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common'
import { CameraDevicesService } from './camera-devices.service'
import { CreateCameraDeviceDto } from './dto/create-camera-device.dto'
import { UpdateCameraDeviceDto } from './dto/update-camera-device.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('camera-devices')
@UseGuards(JwtAuthGuard)
export class CameraDevicesController {
  constructor(private readonly service: CameraDevicesService) {}

  @Post()
  create(@Body() createDto: CreateCameraDeviceDto) {
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateCameraDeviceDto) {
    return this.service.update(id, updateDto)
  }

  @Patch(':id/toggle-status')
  toggleStatus(@Param('id') id: string) {
    return this.service.toggleStatus(id)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}

