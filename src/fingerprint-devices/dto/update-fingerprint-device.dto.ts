import { PartialType } from '@nestjs/mapped-types'
import { CreateFingerprintDeviceDto } from './create-fingerprint-device.dto'

export class UpdateFingerprintDeviceDto extends PartialType(CreateFingerprintDeviceDto) {}

