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
import { ManagerReviewsService } from './manager-reviews.service'
import { CreateManagerReviewDto } from './dto/create-manager-review.dto'
import { UpdateManagerReviewDto } from './dto/update-manager-review.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('manager-reviews')
@UseGuards(JwtAuthGuard)
export class ManagerReviewsController {
  constructor(private readonly managerReviewsService: ManagerReviewsService) {}

  @Post()
  create(@Body() createDto: CreateManagerReviewDto) {
    return this.managerReviewsService.create(createDto)
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.managerReviewsService.findAll(status, search)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.managerReviewsService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateManagerReviewDto) {
    return this.managerReviewsService.update(id, updateDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.managerReviewsService.remove(id)
  }
}

