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
import { LeaveApplicationsService } from './leave-applications.service'
import { CreateLeaveApplicationDto } from './dto/create-leave-application.dto'
import { UpdateLeaveApplicationDto } from './dto/update-leave-application.dto'

@Controller('leave-applications')
@UseGuards(JwtAuthGuard)
export class LeaveApplicationsController {
  constructor(private readonly leaveApplicationsService: LeaveApplicationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createLeaveApplicationDto: CreateLeaveApplicationDto) {
    return this.leaveApplicationsService.create(createLeaveApplicationDto)
  }

  @Get()
  findAll(
    @Query('employeeMasterId') employeeMasterId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    return this.leaveApplicationsService.findAll(employeeMasterId, status, startDate, endDate, search)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leaveApplicationsService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLeaveApplicationDto: UpdateLeaveApplicationDto) {
    return this.leaveApplicationsService.update(id, updateLeaveApplicationDto)
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Body() body?: { comments?: string }) {
    return this.leaveApplicationsService.approve(id, body?.comments)
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body() body: { rejectionReason?: string }) {
    return this.leaveApplicationsService.reject(id, body.rejectionReason || 'No reason provided')
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.leaveApplicationsService.remove(id)
  }
}

