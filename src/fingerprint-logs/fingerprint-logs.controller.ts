import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common'
import { FingerprintLogsService } from './fingerprint-logs.service'
import { CreateFingerprintLogDto } from './dto/create-fingerprint-log.dto'
import { UpdateFingerprintLogDto } from './dto/update-fingerprint-log.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('fingerprint-logs')
@UseGuards(JwtAuthGuard)
export class FingerprintLogsController {
  constructor(private readonly service: FingerprintLogsService) {}

  @Post()
  create(@Body() createDto: CreateFingerprintLogDto) {
    return this.service.create(createDto)
  }

  @Get()
  findAll(
    @Query('fingerprintDeviceId') fingerprintDeviceId?: string,
    @Query('employeeMasterId') employeeMasterId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number,
  ) {
    return this.service.findAll(fingerprintDeviceId, employeeMasterId, status, startDate, endDate, limit)
  }

  @Get('recent')
  findRecent(@Query('limit') limit?: number) {
    return this.service.findRecent(limit || 50)
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
  update(@Param('id') id: string, @Body() updateDto: UpdateFingerprintLogDto) {
    return this.service.update(id, updateDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}

