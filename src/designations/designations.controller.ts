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
import { DesignationsService } from './designations.service'
import { CreateDesignationDto } from './dto/create-designation.dto'
import { UpdateDesignationDto } from './dto/update-designation.dto'

@Controller('designations')
@UseGuards(JwtAuthGuard)
export class DesignationsController {
  constructor(private readonly designationsService: DesignationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDesignationDto: CreateDesignationDto) {
    return this.designationsService.create(createDesignationDto)
  }

  @Get()
  findAll(@Query('isActive') isActive?: string, @Query('department') department?: string) {
    const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined
    return this.designationsService.findAll(isActiveBool, department)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.designationsService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDesignationDto: UpdateDesignationDto) {
    return this.designationsService.update(id, updateDesignationDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.designationsService.remove(id)
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    return this.designationsService.toggleActive(id)
  }
}

