import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common'
import { UniformItemsService } from './uniform-items.service'
import { CreateUniformItemDto } from './dto/create-uniform-item.dto'
import { UpdateUniformItemDto } from './dto/update-uniform-item.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('uniform-items')
@UseGuards(JwtAuthGuard)
export class UniformItemsController {
  constructor(private readonly service: UniformItemsService) {}

  @Post()
  create(@Body() createDto: CreateUniformItemDto) {
    return this.service.create(createDto)
  }

  @Get()
  findAll(@Query('search') search?: string, @Query('category') category?: string) {
    return this.service.findAll(search, category)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateUniformItemDto) {
    return this.service.update(id, updateDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}

