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
import { EmployeeAssignmentsService } from './employee-assignments.service'
import { CreateEmployeeAssignmentDto } from './dto/create-employee-assignment.dto'
import { UpdateEmployeeAssignmentDto } from './dto/update-employee-assignment.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('employee-assignments')
@UseGuards(JwtAuthGuard)
export class EmployeeAssignmentsController {
  constructor(private readonly employeeAssignmentsService: EmployeeAssignmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createEmployeeAssignmentDto: CreateEmployeeAssignmentDto) {
    return this.employeeAssignmentsService.create(createEmployeeAssignmentDto)
  }

  @Get()
  findAll(
    @Query('employeeId') employeeId?: string,
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
  ) {
    return this.employeeAssignmentsService.findAll(employeeId, projectId, status)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeAssignmentsService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmployeeAssignmentDto: UpdateEmployeeAssignmentDto) {
    return this.employeeAssignmentsService.update(id, updateEmployeeAssignmentDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.employeeAssignmentsService.remove(id)
  }
}
