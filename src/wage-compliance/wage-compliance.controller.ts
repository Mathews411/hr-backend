import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { WageComplianceService } from './wage-compliance.service'

@Controller('wage-compliance')
@UseGuards(JwtAuthGuard)
export class WageComplianceController {
  constructor(private readonly wageComplianceService: WageComplianceService) {}

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('state') state?: string,
    @Query('month') month?: string,
    @Query('search') search?: string,
  ) {
    return this.wageComplianceService.findAll(status, state, month, search)
  }
}

