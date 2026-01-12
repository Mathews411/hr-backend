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
import { LeaveBalancesService } from './leave-balances.service'
import { CreateLeaveBalanceDto } from './dto/create-leave-balance.dto'
import { UpdateLeaveBalanceDto } from './dto/update-leave-balance.dto'

@Controller('leave-balances')
@UseGuards(JwtAuthGuard)
export class LeaveBalancesController {
  constructor(private readonly leaveBalancesService: LeaveBalancesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createLeaveBalanceDto: CreateLeaveBalanceDto) {
    return this.leaveBalancesService.create(createLeaveBalanceDto)
  }

  @Get()
  findAll(
    @Query('employeeId') employeeId?: string,
    @Query('year') year?: string,
    @Query('departmentId') departmentId?: string,
    @Query('search') search?: string,
  ) {
    const yearNum = year ? parseInt(year, 10) : undefined
    return this.leaveBalancesService.findAll(employeeId, yearNum, departmentId, search)
  }

  @Get('employee')
  findByEmployee(
    @Query('employeeId') employeeId: string,
    @Query('year') year?: string,
  ) {
    const yearNum = year ? parseInt(year, 10) : undefined
    return this.leaveBalancesService.findByEmployee(employeeId, yearNum)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leaveBalancesService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLeaveBalanceDto: UpdateLeaveBalanceDto) {
    return this.leaveBalancesService.update(id, updateLeaveBalanceDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.leaveBalancesService.remove(id)
  }
}

