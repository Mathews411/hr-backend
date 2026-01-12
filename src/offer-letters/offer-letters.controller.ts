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
import { OfferLettersService } from './offer-letters.service'
import { CreateOfferLetterDto } from './dto/create-offer-letter.dto'
import { UpdateOfferLetterDto } from './dto/update-offer-letter.dto'

@Controller('offer-letters')
@UseGuards(JwtAuthGuard)
export class OfferLettersController {
  constructor(private readonly offerLettersService: OfferLettersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createOfferLetterDto: CreateOfferLetterDto) {
    return this.offerLettersService.create(createOfferLetterDto)
  }

  @Get()
  findAll(@Query('status') status?: string, @Query('search') search?: string) {
    return this.offerLettersService.findAll(status, search)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.offerLettersService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOfferLetterDto: UpdateOfferLetterDto) {
    return this.offerLettersService.update(id, updateOfferLetterDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.offerLettersService.remove(id)
  }
}
