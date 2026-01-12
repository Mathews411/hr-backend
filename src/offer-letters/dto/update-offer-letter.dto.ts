import { PartialType } from '@nestjs/mapped-types'
import { CreateOfferLetterDto, OfferLetterStatus } from './create-offer-letter.dto'
import { IsOptional, IsEnum, IsDateString } from 'class-validator'

export class UpdateOfferLetterDto extends PartialType(CreateOfferLetterDto) {
  @IsOptional()
  @IsEnum(OfferLetterStatus)
  status?: OfferLetterStatus

  @IsOptional()
  @IsDateString()
  sentDate?: string

  @IsOptional()
  @IsDateString()
  acceptedDate?: string

  @IsOptional()
  @IsDateString()
  rejectedDate?: string
}

