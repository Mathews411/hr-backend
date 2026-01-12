import { Module } from '@nestjs/common'
import { FaceRecognitionLogsService } from './face-recognition-logs.service'
import { FaceRecognitionLogsController } from './face-recognition-logs.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [FaceRecognitionLogsController],
  providers: [FaceRecognitionLogsService],
  exports: [FaceRecognitionLogsService],
})
export class FaceRecognitionLogsModule {}

