import { PartialType } from '@nestjs/mapped-types'
import { CreateEmailAlertDto } from './create-email-alert.dto'

export class UpdateEmailAlertDto extends PartialType(CreateEmailAlertDto) {}

