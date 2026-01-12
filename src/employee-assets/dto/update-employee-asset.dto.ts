import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator'

export class UpdateEmployeeAssetDto {
  @IsOptional()
  @IsString()
  assetItemId?: string

  @IsOptional()
  @IsString()
  serialNumber?: string

  @IsOptional()
  @IsDateString()
  expectedReturnDate?: string

  @IsOptional()
  @IsEnum(['ISSUED', 'RETURNED', 'LOST', 'DAMAGED', 'UNDER_REPAIR', 'EXPIRED'])
  status?: 'ISSUED' | 'RETURNED' | 'LOST' | 'DAMAGED' | 'UNDER_REPAIR' | 'EXPIRED'

  @IsOptional()
  @IsString()
  condition?: string

  @IsOptional()
  @IsDateString()
  warrantyExpiryDate?: string

  @IsOptional()
  @IsString()
  location?: string

  @IsOptional()
  @IsString()
  remarks?: string

  @IsOptional()
  @IsDateString()
  returnDate?: string

  @IsOptional()
  @IsString()
  returnedBy?: string
}

