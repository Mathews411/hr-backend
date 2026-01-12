import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common'
import { IDCardTemplatesService } from './id-card-templates.service'
import { CreateIDCardTemplateDto } from './dto/create-id-card-template.dto'
import { UpdateIDCardTemplateDto } from './dto/update-id-card-template.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('id-card-templates')
@UseGuards(JwtAuthGuard)
export class IDCardTemplatesController {
  constructor(private readonly service: IDCardTemplatesService) {}

  @Post()
  create(@Body() createDto: CreateIDCardTemplateDto) {
    return this.service.create(createDto)
  }

  @Get()
  findAll() {
    return this.service.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateIDCardTemplateDto) {
    return this.service.update(id, updateDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}

