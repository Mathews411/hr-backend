import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator'

export class CreateUniformAllocationDto {
  @IsString()
  employeeMasterId: string

  @IsString()
  uniformItemId: string

  @IsString()
  size: string

  @IsNumber()
  quantity: number

  @IsDateString()
  @IsOptional()
  issueDate?: string

  @IsDateString()
  @IsOptional()
  expectedReturnDate?: string

  @IsString()
  @IsOptional()
  condition?: string

  @IsString()
  @IsOptional()
  remarks?: string

  @IsString()
  @IsOptional()
  issuedBy?: string
}

