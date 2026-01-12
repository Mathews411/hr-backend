import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common'
import { GeneratedIDCardsService } from './generated-id-cards.service'
import { CreateGeneratedIDCardDto } from './dto/create-generated-id-card.dto'
import { UpdateGeneratedIDCardDto } from './dto/update-generated-id-card.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('generated-id-cards')
@UseGuards(JwtAuthGuard)
export class GeneratedIDCardsController {
  constructor(private readonly service: GeneratedIDCardsService) {}

  @Post()
  create(@Body() createDto: CreateGeneratedIDCardDto) {
    return this.service.create(createDto)
  }

  @Get()
  findAll(
    @Query('employeeMasterId') employeeMasterId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(employeeMasterId, status, search)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateGeneratedIDCardDto) {
    return this.service.update(id, updateDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}

