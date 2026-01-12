import { Module } from '@nestjs/common'
import { AssetItemsService } from './asset-items.service'
import { AssetItemsController } from './asset-items.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [AssetItemsController],
  providers: [AssetItemsService],
  exports: [AssetItemsService],
})
export class AssetItemsModule {}

