import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common'
import { LocationDeviationAlertsService } from './location-deviation-alerts.service'
import { CreateLocationDeviationAlertDto } from './dto/create-location-deviation-alert.dto'
import { UpdateLocationDeviationAlertDto } from './dto/update-location-deviation-alert.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('location-deviation-alerts')
@UseGuards(JwtAuthGuard)
export class LocationDeviationAlertsController {
  constructor(private readonly service: LocationDeviationAlertsService) {}

  @Post()
  create(@Body() createDto: CreateLocationDeviationAlertDto) {
    return this.service.create(createDto)
  }

  @Get()
  findAll(
    @Query('alertType') alertType?: string,
    @Query('severity') severity?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.findAll(alertType, severity, status, startDate, endDate)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateLocationDeviationAlertDto) {
    return this.service.update(id, updateDto)
  }

  @Patch(':id/resolve')
  resolve(
    @Param('id') id: string,
    @Body() body: { resolvedBy?: string; remarks?: string },
  ) {
    return this.service.resolve(id, body.resolvedBy, body.remarks)
  }
}

