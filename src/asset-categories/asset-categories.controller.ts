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
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { AssetCategoriesService } from './asset-categories.service'
import { CreateAssetCategoryDto } from './dto/create-asset-category.dto'
import { UpdateAssetCategoryDto } from './dto/update-asset-category.dto'

@Controller('asset-categories')
@UseGuards(JwtAuthGuard)
export class AssetCategoriesController {
  constructor(private readonly assetCategoriesService: AssetCategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAssetCategoryDto: CreateAssetCategoryDto) {
    return this.assetCategoriesService.create(createAssetCategoryDto)
  }

  @Get()
  findAll(@Query('isActive') isActive?: string) {
    const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined
    return this.assetCategoriesService.findAll(isActiveBool)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetCategoriesService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAssetCategoryDto: UpdateAssetCategoryDto) {
    return this.assetCategoriesService.update(id, updateAssetCategoryDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.assetCategoriesService.remove(id)
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    return this.assetCategoriesService.toggleActive(id)
  }
}

