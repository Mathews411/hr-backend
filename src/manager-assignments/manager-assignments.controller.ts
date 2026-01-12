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
import { ManagerAssignmentsService } from './manager-assignments.service'
import { CreateManagerAssignmentDto } from './dto/create-manager-assignment.dto'
import { UpdateManagerAssignmentDto } from './dto/update-manager-assignment.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { ManagerAssignmentStatus } from '@prisma/client'

@Controller('manager-assignments')
@UseGuards(JwtAuthGuard)
export class ManagerAssignmentsController {
  constructor(private readonly managerAssignmentsService: ManagerAssignmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createManagerAssignmentDto: CreateManagerAssignmentDto) {
    return this.managerAssignmentsService.create(createManagerAssignmentDto)
  }

  @Get()
  findAll(
    @Query('userId') userId?: string,
    @Query('projectId') projectId?: string,
    @Query('status') status?: ManagerAssignmentStatus,
  ) {
    return this.managerAssignmentsService.findAll(userId, projectId, status)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.managerAssignmentsService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateManagerAssignmentDto: UpdateManagerAssignmentDto) {
    return this.managerAssignmentsService.update(id, updateManagerAssignmentDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.managerAssignmentsService.remove(id)
  }
}
