import { Module } from '@nestjs/common'
import { CandidateApplicationsService } from './candidate-applications.service'
import { CandidateApplicationsController } from './candidate-applications.controller'

@Module({
  controllers: [CandidateApplicationsController],
  providers: [CandidateApplicationsService],
  exports: [CandidateApplicationsService],
})
export class CandidateApplicationsModule {}

