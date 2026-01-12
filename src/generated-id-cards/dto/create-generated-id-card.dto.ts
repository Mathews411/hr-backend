import { IsString, IsOptional, IsDateString } from 'class-validator'

export class CreateGeneratedIDCardDto {
  @IsString()
  employeeMasterId: string

  @IsString()
  templateId: string

  @IsString()
  @IsOptional()
  photoUrl?: string

  @IsDateString()
  @IsOptional()
  issueDate?: string

  @IsDateString()
  @IsOptional()
  expiryDate?: string

  @IsString()
  @IsOptional()
  qrCode?: string
}

