import { IsString, IsOptional, IsEnum, IsBoolean, MinLength } from 'class-validator'
import { TicketStatus } from '@prisma/client'

export class CreateTicketResponseDto {
  @IsString()
  ticketId: string

  @IsString()
  respondedBy: string

  @IsString()
  @MinLength(10)
  response: string

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus

  @IsOptional()
  @IsBoolean()
  isInternal?: boolean
}

