import { PartialType } from '@nestjs/mapped-types'
import { CreateOvertimeRecordDto } from './create-overtime-record.dto'

export class UpdateOvertimeRecordDto extends PartialType(CreateOvertimeRecordDto) {}

