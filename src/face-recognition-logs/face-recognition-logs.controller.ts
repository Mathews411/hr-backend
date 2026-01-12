import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common'
import { FaceRecognitionLogsService } from './face-recognition-logs.service'
import { CreateFaceRecognitionLogDto } from './dto/create-face-recognition-log.dto'
import { UpdateFaceRecognitionLogDto } from './dto/update-face-recognition-log.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('face-recognition-logs')
@UseGuards(JwtAuthGuard)
export class FaceRecognitionLogsController {
  constructor(private readonly service: FaceRecognitionLogsService) {}

  @Post()
  create(@Body() createDto: CreateFaceRecognitionLogDto) {
    return this.service.create(createDto)
  }

  @Get()
  findAll(
    @Query('cameraDeviceId') cameraDeviceId?: string,
    @Query('employeeMasterId') employeeMasterId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll(
      cameraDeviceId,
      employeeMasterId,
      status,
      startDate,
      endDate,
      limit ? parseInt(limit) : undefined,
    )
  }

  @Get('recent')
  findRecent(@Query('limit') limit?: string) {
    return this.service.findRecent(limit ? parseInt(limit) : 50)
  }

  @Get('statistics')
  getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.getStatistics(startDate, endDate)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateFaceRecognitionLogDto) {
    return this.service.update(id, updateDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}

