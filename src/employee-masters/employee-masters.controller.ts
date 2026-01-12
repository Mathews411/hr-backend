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
import { EmployeeMastersService } from './employee-masters.service'
import { CreateEmployeeMasterDto } from './dto/create-employee-master.dto'
import { UpdateEmployeeMasterDto } from './dto/update-employee-master.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('employee-masters')
@UseGuards(JwtAuthGuard)
export class EmployeeMastersController {
  constructor(private readonly employeeMastersService: EmployeeMastersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createEmployeeMasterDto: CreateEmployeeMasterDto) {
    return this.employeeMastersService.create(createEmployeeMasterDto)
  }

  @Get()
  findAll(
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.employeeMastersService.findAll(departmentId, status, search)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeMastersService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmployeeMasterDto: UpdateEmployeeMasterDto) {
    return this.employeeMastersService.update(id, updateEmployeeMasterDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.employeeMastersService.remove(id)
  }
}
