import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, Min, Max } from 'class-validator'

export enum FaceRecognitionStatus {
  RECOGNIZED = 'RECOGNIZED',
  FAILED = 'FAILED',
  UNKNOWN = 'UNKNOWN'
}

export class CreateFaceRecognitionLogDto {
  @IsOptional()
  @IsString()
  employeeMasterId?: string

  @IsString()
  cameraDeviceId: string

  @IsOptional()
  @IsDateString()
  recognitionTime?: string

  @IsOptional()
  @IsEnum(FaceRecognitionStatus)
  status?: FaceRecognitionStatus

  @IsNumber()
  @Min(0)
  @Max(100)
  confidence: number

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

