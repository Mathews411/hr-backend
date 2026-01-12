import { Module } from '@nestjs/common'
import { LocationDeviationAlertsService } from './location-deviation-alerts.service'
import { LocationDeviationAlertsController } from './location-deviation-alerts.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [LocationDeviationAlertsController],
  providers: [LocationDeviationAlertsService],
  exports: [LocationDeviationAlertsService],
})
export class LocationDeviationAlertsModule {}

