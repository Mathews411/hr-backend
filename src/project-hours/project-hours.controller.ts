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
import { ProjectHoursService } from './project-hours.service'
import { CreateProjectHoursDto } from './dto/create-project-hours.dto'
import { UpdateProjectHoursDto } from './dto/update-project-hours.dto'

@Controller('project-hours')
@UseGuards(JwtAuthGuard)
export class ProjectHoursController {
  constructor(private readonly service: ProjectHoursService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateProjectHoursDto) {
    return this.service.create(createDto)
  }

  @Get()
  findAll(
    @Query('employeeId') employeeId?: string,
    @Query('projectId') projectId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(employeeId, projectId, startDate, endDate, search)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateProjectHoursDto) {
    return this.service.update(id, updateDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}

