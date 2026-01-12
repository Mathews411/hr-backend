import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common'
import { GeofenceProjectAssignmentsService } from './geofence-project-assignments.service'
import { CreateGeofenceProjectAssignmentDto } from './dto/create-geofence-project-assignment.dto'
import { UpdateGeofenceProjectAssignmentDto } from './dto/update-geofence-project-assignment.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('geofence-project-assignments')
@UseGuards(JwtAuthGuard)
export class GeofenceProjectAssignmentsController {
  constructor(private readonly service: GeofenceProjectAssignmentsService) {}

  @Post()
  create(@Body() createDto: CreateGeofenceProjectAssignmentDto) {
    return this.service.create(createDto)
  }

  @Get()
  findAll(@Query('projectId') projectId?: string) {
    return this.service.findAll(projectId)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateGeofenceProjectAssignmentDto) {
    return this.service.update(id, updateDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}

