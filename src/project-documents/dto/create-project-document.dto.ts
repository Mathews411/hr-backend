import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator'

export class CreateProjectDocumentDto {
  @IsString()
  projectId: string

  @IsString()
  fileName: string

  @IsString()
  fileType: string

  @IsNumber()
  fileSize: number

  @IsOptional()
  @IsString()
  fileUrl?: string

  @IsString()
  category: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  version?: string

  @IsOptional()
  @IsString()
  uploadedBy?: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

