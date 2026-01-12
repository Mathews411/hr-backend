import { PartialType } from '@nestjs/mapped-types'
import { CreateFingerprintLogDto } from './create-fingerprint-log.dto'

export class UpdateFingerprintLogDto extends PartialType(CreateFingerprintLogDto) {}

