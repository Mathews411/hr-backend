import { IsString, IsOptional, IsBoolean, IsInt, IsDateString, Min } from 'class-validator'

export class CreateHolidayDto {
  @IsString()
  holidayName: string

  @IsDateString()
  holidayDate: string // ISO date string

  @IsString()
  holidayType: string // 'National', 'State', 'Regional', 'Optional', 'Company'

  @IsString()
  applicableTo: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsInt()
  @Min(2000)
  year: number
}

