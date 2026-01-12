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
import { NightShiftAllowancesService } from './night-shift-allowances.service'
import { CreateNightShiftAllowanceDto } from './dto/create-night-shift-allowance.dto'
import { UpdateNightShiftAllowanceDto } from './dto/update-night-shift-allowance.dto'

@Controller('night-shift-allowances')
@UseGuards(JwtAuthGuard)
export class NightShiftAllowancesController {
  constructor(private readonly service: NightShiftAllowancesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateNightShiftAllowanceDto) {
    return this.service.create(createDto)
  }

  @Get()
  findAll(
    @Query('employeeId') employeeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(employeeId, startDate, endDate, search)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateNightShiftAllowanceDto) {
    return this.service.update(id, updateDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}

