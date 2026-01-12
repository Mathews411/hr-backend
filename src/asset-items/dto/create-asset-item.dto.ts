import { IsString, IsOptional, IsBoolean, IsNumber, IsDateString } from 'class-validator'

export class CreateAssetItemDto {
  @IsString()
  assetName: string

  @IsString()
  assetCode: string

  @IsString()
  category: string

  @IsOptional()
  @IsString()
  brand?: string

  @IsOptional()
  @IsString()
  model?: string

  @IsOptional()
  @IsDateString()
  purchaseDate?: string

  @IsNumber()
  purchaseCost: number

  @IsOptional()
  @IsNumber()
  warrantyPeriod?: number

  @IsOptional()
  @IsDateString()
  warrantyExpiryDate?: string

  @IsNumber()
  totalQuantity: number

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

