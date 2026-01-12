import { IsString, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator'
import { TicketPriority } from '@prisma/client'

export class CreateHRTicketDto {
  @IsString()
  employeeMasterId: string

  @IsString()
  @MinLength(1)
  ticketType: string

  @IsString()
  @MinLength(1)
  category: string

  @IsString()
  @MinLength(10)
  @MaxLength(200)
  subject: string

  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  description: string

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority

  @IsOptional()
  @IsString()
  relatedTo?: string
}

