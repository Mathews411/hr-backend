import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { HRTicketsService } from './hr-tickets.service'
import { CreateHRTicketDto } from './dto/create-hr-ticket.dto'
import { UpdateHRTicketDto } from './dto/update-hr-ticket.dto'
import { CreateTicketResponseDto } from './dto/create-ticket-response.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('hr-tickets')
@UseGuards(JwtAuthGuard)
export class HRTicketsController {
  constructor(private readonly hrTicketsService: HRTicketsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateHRTicketDto) {
    return this.hrTicketsService.create(createDto)
  }

  @Get()
  findAll(
    @Query('employeeMasterId') employeeMasterId?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.hrTicketsService.findAll(employeeMasterId, status, priority, category, search)
  }

  @Get('resolution-reports')
  getResolutionReports(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('category') category?: string,
  ) {
    return this.hrTicketsService.getResolutionReports(startDate, endDate, category)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hrTicketsService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateHRTicketDto) {
    return this.hrTicketsService.update(id, updateDto)
  }

  @Post(':id/responses')
  @HttpCode(HttpStatus.CREATED)
  addResponse(@Param('id') id: string, @Body() createDto: Omit<CreateTicketResponseDto, 'ticketId'>) {
    return this.hrTicketsService.addResponse({
      ...createDto,
      ticketId: id,
    })
  }
}

