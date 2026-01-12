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
import { DailyAttendanceService } from './daily-attendance.service'
import { CreateDailyAttendanceDto } from './dto/create-daily-attendance.dto'
import { UpdateDailyAttendanceDto } from './dto/update-daily-attendance.dto'

@Controller('daily-attendance')
@UseGuards(JwtAuthGuard)
export class DailyAttendanceController {
  constructor(private readonly service: DailyAttendanceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateDailyAttendanceDto) {
    return this.service.create(createDto)
  }

  @Get()
  findAll(
    @Query('employeeId') employeeId?: string,
    @Query('date') date?: string,
    @Query('status') status?: string,
    @Query('departmentId') departmentId?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(employeeId, date, status, departmentId, search)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateDailyAttendanceDto) {
    return this.service.update(id, updateDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}

