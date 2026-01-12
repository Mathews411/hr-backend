import { IsString, IsOptional, IsBoolean, IsArray, ValidateNested, IsNumber, IsEnum } from 'class-validator'
import { Type, Transform } from 'class-transformer'

class SalaryComponentDto {
  @IsString()
  name: string

  @IsEnum(['earning', 'deduction', 'contribution'])
  type: 'earning' | 'deduction' | 'contribution'

  @IsEnum(['percentage-of-ctc', 'percentage-of-basic', 'fixed-amount', 'balancing-amount', 'slab-based', 'as-per-state'])
  calculationType: 'percentage-of-ctc' | 'percentage-of-basic' | 'fixed-amount' | 'balancing-amount' | 'slab-based' | 'as-per-state'

  @IsOptional()
  @Transform(({ value }) => {
    // If it's a string like "Auto" or "As per state", keep it as string
    // If it's a number, keep it as number
    if (typeof value === 'string' && (value === 'Auto' || value === 'As per state')) {
      return value
    }
    // Try to parse as number, but keep string if it fails
    const num = Number(value)
    return isNaN(num) ? value : num
  })
  value?: number | string // Can be number (percentage/amount) or string (Auto, As per state)

  @IsOptional()
  @IsEnum(['yes', 'no', 'partially'])
  isTaxable?: 'yes' | 'no' | 'partially'

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

export class CreateSalaryTemplateDto {
  @IsString()
  templateName: string

  @IsString()
  templateCode: string

  @IsString()
  templateType: string

  @IsString()
  description: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalaryComponentDto)
  components: SalaryComponentDto[]

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

