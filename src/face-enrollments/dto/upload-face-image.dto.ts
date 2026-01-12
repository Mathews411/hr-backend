import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator'

export class UploadFaceImageDto {
  @IsString()
  faceEnrollmentId: string

  @IsString()
  imageUrl: string

  @IsString()
  imageName: string

  @IsNumber()
  @Min(0)
  imageSize: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  qualityScore?: number
}

