import { IsString, IsOptional, IsBoolean, IsNumber, IsDateString } from 'class-validator'

export class UpdateAssetItemDto {
  @IsOptional()
  @IsString()
  assetName?: string

  @IsOptional()
  @IsString()
  assetCode?: string

  @IsOptional()
  @IsString()
  category?: string

  @IsOptional()
  @IsString()
  brand?: string

  @IsOptional()
  @IsString()
  model?: string

  @IsOptional()
  @IsDateString()
  purchaseDate?: string

  @IsOptional()
  @IsNumber()
  purchaseCost?: number

  @IsOptional()
  @IsNumber()
  warrantyPeriod?: number

  @IsOptional()
  @IsDateString()
  warrantyExpiryDate?: string

  @IsOptional()
  @IsNumber()
  totalQuantity?: number

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

