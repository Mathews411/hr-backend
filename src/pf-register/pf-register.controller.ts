import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PfRegisterService } from './pf-register.service'

@Controller('pf-register')
@UseGuards(JwtAuthGuard)
export class PfRegisterController {
  constructor(private readonly pfRegisterService: PfRegisterService) {}

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('month') month?: string,
    @Query('search') search?: string,
  ) {
    return this.pfRegisterService.findAll(status, month, search)
  }
}

