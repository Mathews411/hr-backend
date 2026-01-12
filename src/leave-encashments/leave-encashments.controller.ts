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
import { LeaveEncashmentsService } from './leave-encashments.service'
import { CreateLeaveEncashmentDto } from './dto/create-leave-encashment.dto'
import { UpdateLeaveEncashmentDto } from './dto/update-leave-encashment.dto'

@Controller('leave-encashments')
@UseGuards(JwtAuthGuard)
export class LeaveEncashmentsController {
  constructor(private readonly leaveEncashmentsService: LeaveEncashmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createLeaveEncashmentDto: CreateLeaveEncashmentDto) {
    return this.leaveEncashmentsService.create(createLeaveEncashmentDto)
  }

  @Get()
  findAll(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    return this.leaveEncashmentsService.findAll(employeeId, status, startDate, endDate, search)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leaveEncashmentsService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLeaveEncashmentDto: UpdateLeaveEncashmentDto) {
    return this.leaveEncashmentsService.update(id, updateLeaveEncashmentDto)
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Body() body?: { approvedBy?: string }) {
    return this.leaveEncashmentsService.approve(id, body?.approvedBy)
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body() body: { rejectionReason?: string }) {
    return this.leaveEncashmentsService.reject(id, body.rejectionReason || 'No reason provided')
  }

  @Patch(':id/process')
  process(@Param('id') id: string) {
    return this.leaveEncashmentsService.process(id)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.leaveEncashmentsService.remove(id)
  }
}

