import { Module } from '@nestjs/common';
import { CandidateOnboardingsController } from './candidate-onboardings.controller';
import { CandidateOnboardingsService } from './candidate-onboardings.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CandidateOnboardingsController],
  providers: [CandidateOnboardingsService]
})
export class CandidateOnboardingsModule {}
