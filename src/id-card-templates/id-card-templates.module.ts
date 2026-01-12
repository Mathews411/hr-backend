import { Module } from '@nestjs/common'
import { IDCardTemplatesService } from './id-card-templates.service'
import { IDCardTemplatesController } from './id-card-templates.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [IDCardTemplatesController],
  providers: [IDCardTemplatesService],
  exports: [IDCardTemplatesService],
})
export class IDCardTemplatesModule {}

