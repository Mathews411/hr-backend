import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common'
import { FingerprintEnrollmentsService } from './fingerprint-enrollments.service'
import { CreateFingerprintEnrollmentDto } from './dto/create-fingerprint-enrollment.dto'
import { UpdateFingerprintEnrollmentDto } from './dto/update-fingerprint-enrollment.dto'
import { EnrollFingerprintDto } from './dto/enroll-fingerprint.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('fingerprint-enrollments')
@UseGuards(JwtAuthGuard)
export class FingerprintEnrollmentsController {
  constructor(private readonly service: FingerprintEnrollmentsService) {}

  @Post()
  create(@Body() createDto: CreateFingerprintEnrollmentDto) {
    return this.service.create(createDto)
  }

  @Get()
  findAll(
    @Query('employeeMasterId') employeeMasterId?: string,
    @Query('deviceId') deviceId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(employeeMasterId, deviceId, status, search)
  }

  @Get('employee/:employeeMasterId')
  async findByEmployeeId(
    @Param('employeeMasterId') employeeMasterId: string,
    @Query('deviceId') deviceId?: string,
  ) {
    return await this.service.findByEmployeeId(employeeMasterId, deviceId)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateFingerprintEnrollmentDto) {
    return this.service.update(id, updateDto)
  }

  @Post(':id/enroll')
  enrollFingerprint(
    @Param('id') id: string,
    @Body() enrollDto: EnrollFingerprintDto,
  ) {
    return this.service.enrollFingerprint({ ...enrollDto, enrollmentId: id })
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}

