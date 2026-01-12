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
import { AttendanceRegularizationsService } from './attendance-regularizations.service'
import { CreateAttendanceRegularizationDto } from './dto/create-attendance-regularization.dto'
import { UpdateAttendanceRegularizationDto } from './dto/update-attendance-regularization.dto'

@Controller('regularization-requests')
@UseGuards(JwtAuthGuard)
export class AttendanceRegularizationsController {
  constructor(private readonly service: AttendanceRegularizationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateAttendanceRegularizationDto) {
    return this.service.create(createDto)
  }

  @Get()
  findAll(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(employeeId, status, startDate, endDate, search)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateAttendanceRegularizationDto) {
    return this.service.update(id, updateDto)
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.service.approve(id)
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body() body: { rejectionReason?: string }) {
    return this.service.reject(id, body.rejectionReason || 'No reason provided')
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}

