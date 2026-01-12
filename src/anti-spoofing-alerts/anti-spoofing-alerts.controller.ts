import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common'
import { AntiSpoofingAlertsService } from './anti-spoofing-alerts.service'
import { CreateAntiSpoofingAlertDto } from './dto/create-anti-spoofing-alert.dto'
import { UpdateAntiSpoofingAlertDto } from './dto/update-anti-spoofing-alert.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('anti-spoofing-alerts')
@UseGuards(JwtAuthGuard)
export class AntiSpoofingAlertsController {
  constructor(private readonly service: AntiSpoofingAlertsService) {}

  @Post()
  create(@Body() createDto: CreateAntiSpoofingAlertDto) {
    return this.service.create(createDto)
  }

  @Get()
  findAll(
    @Query('cameraDeviceId') cameraDeviceId?: string,
    @Query('employeeMasterId') employeeMasterId?: string,
    @Query('alertType') alertType?: string,
    @Query('severity') severity?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.findAll(
      cameraDeviceId,
      employeeMasterId,
      alertType,
      severity,
      status,
      startDate,
      endDate,
    )
  }

  @Get('statistics')
  getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.getStatistics(startDate, endDate)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateAntiSpoofingAlertDto) {
    return this.service.update(id, updateDto)
  }

  @Patch(':id/resolve')
  resolve(
    @Param('id') id: string,
    @Body() body: { resolvedBy?: string; remarks?: string },
  ) {
    return this.service.resolve(id, body.resolvedBy, body.remarks)
  }

  @Patch(':id/mark-false-positive')
  markFalsePositive(
    @Param('id') id: string,
    @Body() body: { remarks?: string },
  ) {
    return this.service.markFalsePositive(id, body.remarks)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}

