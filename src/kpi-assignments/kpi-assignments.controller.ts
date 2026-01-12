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
import { KpiAssignmentsService } from './kpi-assignments.service'
import { CreateKpiAssignmentDto } from './dto/create-kpi-assignment.dto'
import { UpdateKpiAssignmentDto } from './dto/update-kpi-assignment.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('kpi-assignments')
@UseGuards(JwtAuthGuard)
export class KpiAssignmentsController {
  constructor(private readonly kpiAssignmentsService: KpiAssignmentsService) {}

  @Post()
  create(@Body() createDto: CreateKpiAssignmentDto) {
    return this.kpiAssignmentsService.create(createDto)
  }

  @Get()
  findAll(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.kpiAssignmentsService.findAll(employeeId, status, search)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kpiAssignmentsService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateKpiAssignmentDto) {
    return this.kpiAssignmentsService.update(id, updateDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.kpiAssignmentsService.remove(id)
  }
}

