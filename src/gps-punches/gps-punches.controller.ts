import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common'
import { GPSPunchesService } from './gps-punches.service'
import { CreateGPSPunchDto } from './dto/create-gps-punch.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('gps-punches')
@UseGuards(JwtAuthGuard)
export class GPSPunchesController {
  constructor(private readonly service: GPSPunchesService) {}

  @Post()
  create(@Body() createDto: CreateGPSPunchDto) {
    return this.service.create(createDto)
  }

  @Get()
  findAll(
    @Query('employeeMasterId') employeeMasterId?: string,
    @Query('punchType') punchType?: string,
    @Query('status') status?: string,
    @Query('projectId') projectId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(employeeMasterId, punchType, status, projectId, startDate, endDate, search)
  }
}

