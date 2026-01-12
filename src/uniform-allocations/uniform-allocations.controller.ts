import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common'
import { UniformAllocationsService } from './uniform-allocations.service'
import { CreateUniformAllocationDto } from './dto/create-uniform-allocation.dto'
import { UpdateUniformAllocationDto } from './dto/update-uniform-allocation.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('uniform-allocations')
@UseGuards(JwtAuthGuard)
export class UniformAllocationsController {
  constructor(private readonly service: UniformAllocationsService) {}

  @Post()
  create(@Body() createDto: CreateUniformAllocationDto) {
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
  update(@Param('id') id: string, @Body() updateDto: UpdateUniformAllocationDto) {
    return this.service.update(id, updateDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}

