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
import { NotificationTemplatesService } from './notification-templates.service'
import { CreateNotificationTemplateDto } from './dto/create-notification-template.dto'
import { UpdateNotificationTemplateDto } from './dto/update-notification-template.dto'

@Controller('notification-templates')
@UseGuards(JwtAuthGuard)
export class NotificationTemplatesController {
  constructor(private readonly service: NotificationTemplatesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateNotificationTemplateDto, @Request() req: any) {
    return this.service.create(createDto, req.user?.email || 'System')
  }

  @Get()
  findAll(
    @Query('notificationType') notificationType?: string,
    @Query('category') category?: string,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(
      notificationType,
      category,
      isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      search,
    )
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateNotificationTemplateDto) {
    return this.service.update(id, updateDto)
  }

  @Post(':id/duplicate')
  duplicate(@Param('id') id: string, @Request() req: any) {
    return this.service.duplicate(id, req.user?.email || 'System')
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}

