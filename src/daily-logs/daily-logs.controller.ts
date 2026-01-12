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
import { DailyLogsService } from './daily-logs.service'
import { CreateDailyLogDto } from './dto/create-daily-log.dto'
import { UpdateDailyLogDto } from './dto/update-daily-log.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('daily-logs')
@UseGuards(JwtAuthGuard)
export class DailyLogsController {
  constructor(private readonly dailyLogsService: DailyLogsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDailyLogDto: CreateDailyLogDto) {
    return this.dailyLogsService.create(createDailyLogDto)
  }

  @Get()
  findAll(
    @Query('projectId') projectId?: string,
    @Query('employeeId') employeeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.dailyLogsService.findAll(projectId, employeeId, startDate, endDate)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dailyLogsService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDailyLogDto: UpdateDailyLogDto) {
    return this.dailyLogsService.update(id, updateDailyLogDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.dailyLogsService.remove(id)
  }
}
