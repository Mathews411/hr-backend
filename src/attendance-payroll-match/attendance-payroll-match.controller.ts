import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { AttendancePayrollMatchService } from './attendance-payroll-match.service'

@Controller('attendance-payroll-match')
@UseGuards(JwtAuthGuard)
export class AttendancePayrollMatchController {
  constructor(private readonly service: AttendancePayrollMatchService) {}

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('month') month?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(status, month, search)
  }
}

