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
import { SalaryTemplatesService } from './salary-templates.service'
import { CreateSalaryTemplateDto } from './dto/create-salary-template.dto'
import { UpdateSalaryTemplateDto } from './dto/update-salary-template.dto'

@Controller('salary-templates')
@UseGuards(JwtAuthGuard)
export class SalaryTemplatesController {
  constructor(private readonly salaryTemplatesService: SalaryTemplatesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createSalaryTemplateDto: CreateSalaryTemplateDto) {
    return this.salaryTemplatesService.create(createSalaryTemplateDto)
  }

  @Get()
  findAll(@Query('isActive') isActive?: string) {
    const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined
    return this.salaryTemplatesService.findAll(isActiveBool)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salaryTemplatesService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSalaryTemplateDto: UpdateSalaryTemplateDto) {
    return this.salaryTemplatesService.update(id, updateSalaryTemplateDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.salaryTemplatesService.remove(id)
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    return this.salaryTemplatesService.toggleActive(id)
  }
}

