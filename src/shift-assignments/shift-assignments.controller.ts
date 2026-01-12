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
import { ShiftAssignmentsService } from './shift-assignments.service'
import { CreateShiftAssignmentDto } from './dto/create-shift-assignment.dto'
import { UpdateShiftAssignmentDto } from './dto/update-shift-assignment.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('shift-assignments')
@UseGuards(JwtAuthGuard)
export class ShiftAssignmentsController {
  constructor(private readonly shiftAssignmentsService: ShiftAssignmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createShiftAssignmentDto: CreateShiftAssignmentDto) {
    return this.shiftAssignmentsService.create(createShiftAssignmentDto)
  }

  @Get()
  findAll(
    @Query('projectId') projectId?: string,
    @Query('employeeId') employeeId?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.shiftAssignmentsService.findAll(projectId, employeeId, departmentId)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shiftAssignmentsService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShiftAssignmentDto: UpdateShiftAssignmentDto) {
    return this.shiftAssignmentsService.update(id, updateShiftAssignmentDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.shiftAssignmentsService.remove(id)
  }
}
