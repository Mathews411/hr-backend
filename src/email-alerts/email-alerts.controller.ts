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
import { EmailAlertsService } from './email-alerts.service'
import { CreateEmailAlertDto } from './dto/create-email-alert.dto'
import { UpdateEmailAlertDto } from './dto/update-email-alert.dto'

@Controller('email-alerts')
@UseGuards(JwtAuthGuard)
export class EmailAlertsController {
  constructor(private readonly service: EmailAlertsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateEmailAlertDto, @Request() req: any) {
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
  update(@Param('id') id: string, @Body() updateDto: UpdateEmailAlertDto) {
    return this.service.update(id, updateDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}

