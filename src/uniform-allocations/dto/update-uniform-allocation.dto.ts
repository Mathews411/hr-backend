import { IsString, IsNumber, IsOptional, IsDateString, IsEnum } from 'class-validator'

export class UpdateUniformAllocationDto {
  @IsString()
  @IsOptional()
  uniformItemId?: string

  @IsString()
  @IsOptional()
  size?: string

  @IsNumber()
  @IsOptional()
  quantity?: number

  @IsDateString()
  @IsOptional()
  expectedReturnDate?: string

  @IsEnum(['ISSUED', 'RETURNED', 'LOST', 'DAMAGED', 'EXPIRED'])
  @IsOptional()
  status?: 'ISSUED' | 'RETURNED' | 'LOST' | 'DAMAGED' | 'EXPIRED'

  @IsString()
  @IsOptional()
  condition?: string

  @IsString()
  @IsOptional()
  remarks?: string

  @IsDateString()
  @IsOptional()
  returnDate?: string

  @IsString()
  @IsOptional()
  returnedBy?: string
}

