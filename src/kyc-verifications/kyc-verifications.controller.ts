import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { UserResponseDto } from '../auth/dto/auth-response.dto'
import { KYCVerificationsService } from './kyc-verifications.service'
import { CreateKYCVerificationDto } from './dto/create-kyc-verification.dto'
import { UpdateKYCVerificationDto } from './dto/update-kyc-verification.dto'
import { UpdateKYCDocumentDto } from './dto/update-kyc-document.dto'

@Controller('kyc-verifications')
@UseGuards(JwtAuthGuard)
export class KYCVerificationsController {
  constructor(private readonly kycVerificationsService: KYCVerificationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createKYCVerificationDto: CreateKYCVerificationDto) {
    return this.kycVerificationsService.create(createKYCVerificationDto)
  }

  @Get()
  findAll(
    @Query('employeeMasterId') employeeMasterId?: string,
    @Query('verificationStatus') verificationStatus?: string,
    @Query('search') search?: string,
  ) {
    return this.kycVerificationsService.findAll(employeeMasterId, verificationStatus, search)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kycVerificationsService.findOne(id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateKYCVerificationDto: UpdateKYCVerificationDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    // If verifying, set verifiedBy
    if (updateKYCVerificationDto.verificationStatus === 'VERIFIED' && !updateKYCVerificationDto.verifiedBy) {
      updateKYCVerificationDto.verifiedBy = user.id
    }
    return this.kycVerificationsService.update(id, updateKYCVerificationDto)
  }

  @Patch(':id/verify')
  verify(@Param('id') id: string, @CurrentUser() user: UserResponseDto) {
    return this.kycVerificationsService.verify(id, user.id)
  }

  @Patch(':kycId/documents/:documentId')
  updateDocument(
    @Param('kycId') kycId: string,
    @Param('documentId') documentId: string,
    @Body() updateDocumentDto: UpdateKYCDocumentDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.kycVerificationsService.updateDocument(kycId, documentId, updateDocumentDto, user.id)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.kycVerificationsService.remove(id)
  }
}

