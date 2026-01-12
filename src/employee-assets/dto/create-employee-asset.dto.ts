import { IsString, IsOptional, IsDateString } from 'class-validator'

export class CreateEmployeeAssetDto {
  @IsString()
  employeeMasterId: string

  @IsString()
  assetItemId: string

  @IsOptional()
  @IsString()
  serialNumber?: string

  @IsOptional()
  @IsDateString()
  issueDate?: string

  @IsOptional()
  @IsDateString()
  expectedReturnDate?: string

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
  @IsString()
  issuedBy?: string
}

