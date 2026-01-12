import { IsString, IsOptional, IsBoolean, IsNumber, IsArray } from 'class-validator'

export class CreateUniformItemDto {
  @IsString()
  itemName: string

  @IsString()
  itemCode: string

  @IsString()
  category: string

  @IsArray()
  @IsString({ each: true })
  availableSizes: string[]

  @IsNumber()
  unitCost: number

  @IsNumber()
  totalQuantity: number

  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}

