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
import { KpisService } from './kpis.service'
import { CreateKpiDto } from './dto/create-kpi.dto'
import { UpdateKpiDto } from './dto/update-kpi.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('kpis')
@UseGuards(JwtAuthGuard)
export class KpisController {
  constructor(private readonly kpisService: KpisService) {}

  @Post()
  create(@Body() createKpiDto: CreateKpiDto) {
    return this.kpisService.create(createKpiDto)
  }

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('frequency') frequency?: string,
    @Query('search') search?: string,
  ) {
    return this.kpisService.findAll(category, frequency, search)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kpisService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateKpiDto: UpdateKpiDto) {
    return this.kpisService.update(id, updateKpiDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.kpisService.remove(id)
  }
}

