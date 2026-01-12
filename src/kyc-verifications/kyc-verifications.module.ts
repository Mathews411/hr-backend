import { Module } from '@nestjs/common'
import { KYCVerificationsService } from './kyc-verifications.service'
import { KYCVerificationsController } from './kyc-verifications.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [KYCVerificationsController],
  providers: [KYCVerificationsService],
  exports: [KYCVerificationsService],
})
export class KYCVerificationsModule {}

