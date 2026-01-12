import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { SMSAlertsService } from './sms-alerts.service'
import { CreateSMSAlertDto } from './dto/create-sms-alert.dto'
import { UpdateSMSAlertDto } from './dto/update-sms-alert.dto'

@Controller('sms-alerts')
@UseGuards(JwtAuthGuard)
export class SMSAlertsController {
  constructor(private readonly service: SMSAlertsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateSMSAlertDto, @Request() req: any) {
    return this.service.create(createDto, req.user?.email || 'System')
  }

  @Get()
  findAll(@Query('status') status?: string, @Query('search') search?: string) {
    return this.service.findAll(status, search)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateSMSAlertDto) {
    return this.service.update(id, updateDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}

