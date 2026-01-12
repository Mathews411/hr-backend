import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common'
import { EmployeeAssetsService } from './employee-assets.service'
import { CreateEmployeeAssetDto } from './dto/create-employee-asset.dto'
import { UpdateEmployeeAssetDto } from './dto/update-employee-asset.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('employee-assets')
@UseGuards(JwtAuthGuard)
export class EmployeeAssetsController {
  constructor(private readonly service: EmployeeAssetsService) {}

  @Post()
  create(@Body() createDto: CreateEmployeeAssetDto) {
    return this.service.create(createDto)
  }

  @Get()
  findAll(
    @Query('employeeMasterId') employeeMasterId?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(employeeMasterId, status, category, search)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateEmployeeAssetDto) {
    return this.service.update(id, updateDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }

  @Post(':id/recalculate')
  recalculateQuantities(@Param('id') id: string) {
    return this.service.recalculateQuantities(id)
  }
}

