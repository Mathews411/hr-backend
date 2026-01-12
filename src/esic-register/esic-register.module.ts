import { Module } from '@nestjs/common'
import { EsicRegisterService } from './esic-register.service'
import { EsicRegisterController } from './esic-register.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [EsicRegisterController],
  providers: [EsicRegisterService],
  exports: [EsicRegisterService],
})
export class EsicRegisterModule {}
