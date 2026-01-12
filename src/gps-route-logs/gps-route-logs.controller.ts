import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { GPSRouteLogsService } from './gps-route-logs.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('gps-route-logs')
@UseGuards(JwtAuthGuard)
export class GPSRouteLogsController {
  constructor(private readonly service: GPSRouteLogsService) {}

  @Get()
  findAll(
    @Query('employeeMasterId') employeeMasterId?: string,
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(employeeMasterId, projectId, status, startDate, endDate, search)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }
}

