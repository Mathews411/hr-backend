import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator'

export class UpdateGeneratedIDCardDto {
  @IsString()
  @IsOptional()
  templateId?: string

  @IsString()
  @IsOptional()
  photoUrl?: string

  @IsDateString()
  @IsOptional()
  expiryDate?: string

  @IsEnum(['ACTIVE', 'EXPIRED', 'CANCELLED'])
  @IsOptional()
  status?: 'ACTIVE' | 'EXPIRED' | 'CANCELLED'

  @IsDateString()
  @IsOptional()
  printedDate?: string

  @IsString()
  @IsOptional()
  printedBy?: string
}

