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
import { WhatsAppNotificationsService } from './whatsapp-notifications.service'
import { CreateWhatsAppNotificationDto } from './dto/create-whatsapp-notification.dto'
import { UpdateWhatsAppNotificationDto } from './dto/update-whatsapp-notification.dto'

@Controller('whatsapp-notifications')
@UseGuards(JwtAuthGuard)
export class WhatsAppNotificationsController {
  constructor(private readonly service: WhatsAppNotificationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateWhatsAppNotificationDto, @Request() req: any) {
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
  update(@Param('id') id: string, @Body() updateDto: UpdateWhatsAppNotificationDto) {
    return this.service.update(id, updateDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}

