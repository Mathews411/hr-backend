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
import { CandidateApplicationsService } from './candidate-applications.service'
import { CreateCandidateApplicationDto } from './dto/create-candidate-application.dto'
import { UpdateCandidateApplicationDto } from './dto/update-candidate-application.dto'

@Controller('candidate-applications')
@UseGuards(JwtAuthGuard)
export class CandidateApplicationsController {
  constructor(private readonly candidateApplicationsService: CandidateApplicationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCandidateApplicationDto: CreateCandidateApplicationDto) {
    return this.candidateApplicationsService.create(createCandidateApplicationDto)
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('jobId') jobId?: string,
    @Query('jobCode') jobCode?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    return this.candidateApplicationsService.findAll(status, jobId, jobCode, startDate, endDate, search)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.candidateApplicationsService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCandidateApplicationDto: UpdateCandidateApplicationDto) {
    return this.candidateApplicationsService.update(id, updateCandidateApplicationDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.candidateApplicationsService.remove(id)
  }
}

