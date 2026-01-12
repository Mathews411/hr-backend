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
import { JobOpeningsService } from './job-openings.service'
import { CreateJobOpeningDto } from './dto/create-job-opening.dto'
import { UpdateJobOpeningDto } from './dto/update-job-opening.dto'

@Controller('job-openings')
@UseGuards(JwtAuthGuard)
export class JobOpeningsController {
  constructor(private readonly jobOpeningsService: JobOpeningsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createJobOpeningDto: CreateJobOpeningDto) {
    return this.jobOpeningsService.create(createJobOpeningDto)
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('departmentId') departmentId?: string,
    @Query('search') search?: string,
  ) {
    return this.jobOpeningsService.findAll(status, departmentId, search)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobOpeningsService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobOpeningDto: UpdateJobOpeningDto) {
    return this.jobOpeningsService.update(id, updateJobOpeningDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.jobOpeningsService.remove(id)
  }
}


