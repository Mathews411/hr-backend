import { IsString, IsOptional, IsBoolean, IsNumber, IsArray } from 'class-validator'

export class UpdateUniformItemDto {
  @IsString()
  @IsOptional()
  itemName?: string

  @IsString()
  @IsOptional()
  category?: string

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  availableSizes?: string[]

  @IsNumber()
  @IsOptional()
  unitCost?: number

  @IsNumber()
  @IsOptional()
  totalQuantity?: number

  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}

