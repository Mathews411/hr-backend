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
import { HolidaysService } from './holidays.service'
import { CreateHolidayDto } from './dto/create-holiday.dto'
import { UpdateHolidayDto } from './dto/update-holiday.dto'

@Controller('holidays')
@UseGuards(JwtAuthGuard)
export class HolidaysController {
  constructor(private readonly holidaysService: HolidaysService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createHolidayDto: CreateHolidayDto) {
    return this.holidaysService.create(createHolidayDto)
  }

  @Get()
  findAll(@Query('year') year?: string, @Query('isActive') isActive?: string) {
    const yearNum = year ? parseInt(year, 10) : undefined
    const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined
    return this.holidaysService.findAll(yearNum, isActiveBool)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.holidaysService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHolidayDto: UpdateHolidayDto) {
    return this.holidaysService.update(id, updateHolidayDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.holidaysService.remove(id)
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    return this.holidaysService.toggleActive(id)
  }
}

