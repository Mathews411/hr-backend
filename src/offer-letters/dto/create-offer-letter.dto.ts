import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, IsUUID } from 'class-validator'

export enum OfferLetterStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export class CreateOfferLetterDto {
  @IsUUID()
  candidateApplicationId: string

  @IsDateString()
  offerDate: string

  @IsDateString()
  joiningDate: string

  @IsNumber()
  salary: number

  @IsOptional()
  @IsString()
  currency?: string

  @IsString()
  designation: string

  @IsOptional()
  @IsString()
  offerLetterUrl?: string

  @IsOptional()
  @IsEnum(OfferLetterStatus)
  status?: OfferLetterStatus

  @IsOptional()
  @IsDateString()
  expiryDate?: string

  @IsOptional()
  @IsString()
  notes?: string
}

