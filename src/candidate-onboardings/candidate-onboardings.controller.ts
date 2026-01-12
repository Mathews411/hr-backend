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
import { CandidateOnboardingsService } from './candidate-onboardings.service'
import { CreateCandidateOnboardingDto } from './dto/create-candidate-onboarding.dto'
import { UpdateCandidateOnboardingDto } from './dto/update-candidate-onboarding.dto'

@Controller('candidate-onboardings')
@UseGuards(JwtAuthGuard)
export class CandidateOnboardingsController {
  constructor(private readonly candidateOnboardingsService: CandidateOnboardingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCandidateOnboardingDto: CreateCandidateOnboardingDto) {
    return this.candidateOnboardingsService.create(createCandidateOnboardingDto)
  }

  @Get()
  findAll(@Query('status') status?: string, @Query('search') search?: string) {
    return this.candidateOnboardingsService.findAll(status, search)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.candidateOnboardingsService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCandidateOnboardingDto: UpdateCandidateOnboardingDto) {
    return this.candidateOnboardingsService.update(id, updateCandidateOnboardingDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.candidateOnboardingsService.remove(id)
  }
}
