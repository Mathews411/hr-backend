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
import { InterviewsService } from './interviews.service'
import { CreateInterviewDto } from './dto/create-interview.dto'
import { UpdateInterviewDto } from './dto/update-interview.dto'

@Controller('interviews')
@UseGuards(JwtAuthGuard)
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createInterviewDto: CreateInterviewDto) {
    return this.interviewsService.create(createInterviewDto)
  }

  @Get()
  findAll(
    @Query('candidateApplicationId') candidateApplicationId?: string,
    @Query('status') status?: string,
    @Query('roundType') roundType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
    @Query('feedbackStatus') feedbackStatus?: string,
    @Query('hasFeedback') hasFeedback?: string,
  ) {
    return this.interviewsService.findAll(
      candidateApplicationId,
      status,
      roundType,
      startDate,
      endDate,
      search,
      feedbackStatus,
      hasFeedback === 'true',
    )
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.interviewsService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInterviewDto: UpdateInterviewDto) {
    return this.interviewsService.update(id, updateInterviewDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.interviewsService.remove(id)
  }
}

