import { PartialType } from '@nestjs/mapped-types'
import { CreateCheckInOutLogDto } from './create-check-in-out-log.dto'

export class UpdateCheckInOutLogDto extends PartialType(CreateCheckInOutLogDto) {}

