import { PartialType } from '@nestjs/mapped-types'
import { CreateJobOpeningDto } from './create-job-opening.dto'

export class UpdateJobOpeningDto extends PartialType(CreateJobOpeningDto) {}


