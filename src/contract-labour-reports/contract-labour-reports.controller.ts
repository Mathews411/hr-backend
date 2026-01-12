import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { ContractLabourReportsService } from './contract-labour-reports.service'

@Controller('contract-labour-reports')
@UseGuards(JwtAuthGuard)
export class ContractLabourReportsController {
  constructor(private readonly service: ContractLabourReportsService) {}

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('period') period?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(status, type, period, search)
  }
}

