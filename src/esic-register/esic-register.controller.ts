import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { EsicRegisterService } from './esic-register.service'

@Controller('esic-register')
@UseGuards(JwtAuthGuard)
export class EsicRegisterController {
  constructor(private readonly esicRegisterService: EsicRegisterService) {}

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('month') month?: string,
    @Query('search') search?: string,
  ) {
    return this.esicRegisterService.findAll(status, month, search)
  }
}

