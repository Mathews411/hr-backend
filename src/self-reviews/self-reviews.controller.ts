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
import { SelfReviewsService } from './self-reviews.service'
import { CreateSelfReviewDto } from './dto/create-self-review.dto'
import { UpdateSelfReviewDto } from './dto/update-self-review.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('self-reviews')
@UseGuards(JwtAuthGuard)
export class SelfReviewsController {
  constructor(private readonly selfReviewsService: SelfReviewsService) {}

  @Post()
  create(@Body() createDto: CreateSelfReviewDto) {
    return this.selfReviewsService.create(createDto)
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.selfReviewsService.findAll(status, search)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.selfReviewsService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateSelfReviewDto) {
    return this.selfReviewsService.update(id, updateDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.selfReviewsService.remove(id)
  }
}

