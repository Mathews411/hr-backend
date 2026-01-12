import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, Min, Max } from 'class-validator'
import { PartialType } from '@nestjs/mapped-types'
import { CreateFaceRecognitionLogDto, FaceRecognitionStatus } from './create-face-recognition-log.dto'

export class UpdateFaceRecognitionLogDto extends PartialType(CreateFaceRecognitionLogDto) {
  @IsOptional()
  @IsString()
  employeeMasterId?: string

  @IsOptional()
  @IsString()
  cameraDeviceId?: string

  @IsOptional()
  @IsDateString()
  recognitionTime?: string

  @IsOptional()
  @IsEnum(FaceRecognitionStatus)
  status?: FaceRecognitionStatus

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  confidence?: number

  @IsOptional()
  @IsString()
  imageUrl?: string

  @IsOptional()
  @IsString()
  location?: string

  @IsOptional()
  @IsString()
  remarks?: string
}

