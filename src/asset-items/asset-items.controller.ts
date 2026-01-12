import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common'
import { AssetItemsService } from './asset-items.service'
import { CreateAssetItemDto } from './dto/create-asset-item.dto'
import { UpdateAssetItemDto } from './dto/update-asset-item.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('asset-items')
@UseGuards(JwtAuthGuard)
export class AssetItemsController {
  constructor(private readonly service: AssetItemsService) {}

  @Post()
  create(@Body() createDto: CreateAssetItemDto) {
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
  update(@Param('id') id: string, @Body() updateDto: UpdateAssetItemDto) {
    return this.service.update(id, updateDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}

