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
import { OvertimeRecordsService } from './overtime-records.service'
import { CreateOvertimeRecordDto } from './dto/create-overtime-record.dto'
import { UpdateOvertimeRecordDto } from './dto/update-overtime-record.dto'

@Controller('overtime-records')
@UseGuards(JwtAuthGuard)
export class OvertimeRecordsController {
  constructor(private readonly service: OvertimeRecordsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateOvertimeRecordDto) {
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
  update(@Param('id') id: string, @Body() updateDto: UpdateOvertimeRecordDto) {
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

