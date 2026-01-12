import { Module } from '@nestjs/common'
import { PfRegisterService } from './pf-register.service'
import { PfRegisterController } from './pf-register.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [PfRegisterController],
  providers: [PfRegisterService],
  exports: [PfRegisterService],
})
export class PfRegisterModule {}
