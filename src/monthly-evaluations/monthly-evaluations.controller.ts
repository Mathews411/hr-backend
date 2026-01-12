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
} from '@nestjs/common'
import { MonthlyEvaluationsService } from './monthly-evaluations.service'
import { CreateMonthlyEvaluationDto } from './dto/create-monthly-evaluation.dto'
import { UpdateMonthlyEvaluationDto } from './dto/update-monthly-evaluation.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('monthly-evaluations')
@UseGuards(JwtAuthGuard)
export class MonthlyEvaluationsController {
  constructor(private readonly monthlyEvaluationsService: MonthlyEvaluationsService) {}

  @Post()
  create(@Body() createDto: CreateMonthlyEvaluationDto) {
    return this.monthlyEvaluationsService.create(createDto)
  }

  @Get()
  findAll(
    @Query('month') month?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.monthlyEvaluationsService.findAll(month, status, search)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.monthlyEvaluationsService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateMonthlyEvaluationDto) {
    return this.monthlyEvaluationsService.update(id, updateDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.monthlyEvaluationsService.remove(id)
  }
}

