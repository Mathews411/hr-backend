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
import { AppraisalCyclesService } from './appraisal-cycles.service'
import { CreateAppraisalCycleDto } from './dto/create-appraisal-cycle.dto'
import { UpdateAppraisalCycleDto } from './dto/update-appraisal-cycle.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('appraisal-cycles')
@UseGuards(JwtAuthGuard)
export class AppraisalCyclesController {
  constructor(private readonly appraisalCyclesService: AppraisalCyclesService) {}

  @Post()
  create(@Body() createDto: CreateAppraisalCycleDto) {
    return this.appraisalCyclesService.create(createDto)
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.appraisalCyclesService.findAll(status, search)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appraisalCyclesService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateAppraisalCycleDto) {
    return this.appraisalCyclesService.update(id, updateDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appraisalCyclesService.remove(id)
  }
}

