import { PartialType } from '@nestjs/mapped-types'
import { CreateSMSAlertDto } from './create-sms-alert.dto'

export class UpdateSMSAlertDto extends PartialType(CreateSMSAlertDto) {}

