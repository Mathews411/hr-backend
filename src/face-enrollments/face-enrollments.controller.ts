import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { FaceEnrollmentsService } from './face-enrollments.service'
import { CreateFaceEnrollmentDto } from './dto/create-face-enrollment.dto'
import { UpdateFaceEnrollmentDto } from './dto/update-face-enrollment.dto'
import { UploadFaceImageDto } from './dto/upload-face-image.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { existsSync, mkdirSync } from 'fs'

@Controller('face-enrollments')
@UseGuards(JwtAuthGuard)
export class FaceEnrollmentsController {
  constructor(private readonly service: FaceEnrollmentsService) {}

  @Post()
  create(@Body() createDto: CreateFaceEnrollmentDto) {
    return this.service.create(createDto)
  }

  @Get()
  findAll(
    @Query('employeeMasterId') employeeMasterId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(employeeMasterId, status, search)
  }

  @Get('employee/:employeeMasterId')
  async findByEmployeeId(@Param('employeeMasterId') employeeMasterId: string) {
    const enrollment = await this.service.findByEmployeeId(employeeMasterId)
    if (!enrollment) {
      return null
    }
    return enrollment
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateFaceEnrollmentDto) {
    return this.service.update(id, updateDto)
  }

  @Post(':id/upload-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), 'uploads', 'face-images')
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true })
          }
          cb(null, uploadPath)
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`)
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  uploadImage(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: any,
  ) {
    const imageUrl = `/uploads/face-images/${file.filename}`
    const uploadDto: UploadFaceImageDto = {
      faceEnrollmentId: id,
      imageUrl,
      imageName: file.originalname,
      imageSize: file.size,
    }
    return this.service.uploadFaceImage(uploadDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}

