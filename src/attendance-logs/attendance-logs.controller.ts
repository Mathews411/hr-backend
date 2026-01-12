import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { AttendanceLogsService } from './attendance-logs.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('attendance-logs')
@UseGuards(JwtAuthGuard)
export class AttendanceLogsController {
  constructor(private readonly service: AttendanceLogsService) {}

  @Get()
  findAll(
    @Query('employeeMasterId') employeeMasterId?: string,
    @Query('status') status?: string,
    @Query('cameraDeviceId') cameraDeviceId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    return this.service.getAttendanceLogs(
      employeeMasterId,
      status,
      cameraDeviceId,
      startDate,
      endDate,
      search,
    )
  }

  @Get('statistics')
  getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.getAttendanceStatistics(startDate, endDate)
  }
}

