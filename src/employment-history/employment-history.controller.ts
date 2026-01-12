import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common'
import { EmploymentHistoryService } from './employment-history.service'
import { CreateEmploymentHistoryDto } from './dto/create-employment-history.dto'
import { UpdateEmploymentHistoryDto } from './dto/update-employment-history.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('employment-history')
@UseGuards(JwtAuthGuard)
export class EmploymentHistoryController {
  constructor(private readonly service: EmploymentHistoryService) {}

  @Post()
  create(@Body() createDto: CreateEmploymentHistoryDto) {
    return this.service.create(createDto)
  }

  @Get()
  findAll(
    @Query('employeeMasterId') employeeMasterId?: string,
    @Query('eventType') eventType?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(employeeMasterId, eventType, search)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateEmploymentHistoryDto) {
    return this.service.update(id, updateDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}

