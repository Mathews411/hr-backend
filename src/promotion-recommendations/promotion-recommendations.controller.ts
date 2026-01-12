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
} from '@nestjs/common'
import { PromotionRecommendationsService } from './promotion-recommendations.service'
import { CreatePromotionRecommendationDto } from './dto/create-promotion-recommendation.dto'
import { UpdatePromotionRecommendationDto } from './dto/update-promotion-recommendation.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('promotion-recommendations')
@UseGuards(JwtAuthGuard)
export class PromotionRecommendationsController {
  constructor(private readonly promotionRecommendationsService: PromotionRecommendationsService) {}

  @Post()
  create(@Body() createDto: CreatePromotionRecommendationDto) {
    return this.promotionRecommendationsService.create(createDto)
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.promotionRecommendationsService.findAll(status, search)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promotionRecommendationsService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdatePromotionRecommendationDto) {
    return this.promotionRecommendationsService.update(id, updateDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promotionRecommendationsService.remove(id)
  }
}

