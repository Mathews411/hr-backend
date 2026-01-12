import { IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator'
import { TicketStatus, TicketPriority } from '@prisma/client'

export class UpdateHRTicketDto {
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority

  @IsOptional()
  @IsString()
  assignedTo?: string

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  satisfactionRating?: number
}

