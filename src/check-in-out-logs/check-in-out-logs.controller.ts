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
import { CheckInOutLogsService } from './check-in-out-logs.service'
import { CreateCheckInOutLogDto } from './dto/create-check-in-out-log.dto'
import { UpdateCheckInOutLogDto } from './dto/update-check-in-out-log.dto'

@Controller('check-in-out-logs')
@UseGuards(JwtAuthGuard)
export class CheckInOutLogsController {
  constructor(private readonly service: CheckInOutLogsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateCheckInOutLogDto) {
    return this.service.create(createDto)
  }

  @Get()
  findAll(
    @Query('employeeId') employeeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(employeeId, startDate, endDate, status, search)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateCheckInOutLogDto) {
    return this.service.update(id, updateDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}

