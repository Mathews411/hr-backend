import { Module } from '@nestjs/common'
import { JobOpeningsService } from './job-openings.service'
import { JobOpeningsController } from './job-openings.controller'

@Module({
  controllers: [JobOpeningsController],
  providers: [JobOpeningsService],
  exports: [JobOpeningsService],
})
export class JobOpeningsModule {}


