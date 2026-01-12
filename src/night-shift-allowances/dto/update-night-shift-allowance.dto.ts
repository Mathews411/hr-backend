import { PartialType } from '@nestjs/mapped-types'
import { CreateNightShiftAllowanceDto } from './create-night-shift-allowance.dto'

export class UpdateNightShiftAllowanceDto extends PartialType(CreateNightShiftAllowanceDto) {}

