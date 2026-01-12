import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common'
import { GeofenceAreasService } from './geofence-areas.service'
import { CreateGeofenceAreaDto } from './dto/create-geofence-area.dto'
import { UpdateGeofenceAreaDto } from './dto/update-geofence-area.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('geofence-areas')
@UseGuards(JwtAuthGuard)
export class GeofenceAreasController {
  constructor(private readonly service: GeofenceAreasService) {}

  @Post()
  create(@Body() createDto: CreateGeofenceAreaDto) {
    return this.service.create(createDto)
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAll(search, type, status)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateGeofenceAreaDto) {
    return this.service.update(id, updateDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }

  @Patch(':id/toggle-status')
  toggleStatus(@Param('id') id: string) {
    return this.service.toggleStatus(id)
  }
}

