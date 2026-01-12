import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateHolidayDto } from './dto/create-holiday.dto'
import { UpdateHolidayDto } from './dto/update-holiday.dto'

@Injectable()
export class HolidaysService {
  constructor(private prisma: PrismaService) {}

  async create(createHolidayDto: CreateHolidayDto) {
    return this.prisma.holiday.create({
      data: {
        ...createHolidayDto,
        holidayDate: new Date(createHolidayDto.holidayDate),
        isActive: createHolidayDto.isActive ?? true,
      },
    })
  }

  async findAll(year?: number, isActive?: boolean) {
    const where: any = {}
    if (year !== undefined) {
      where.year = year
    }
    if (isActive !== undefined) {
      where.isActive = isActive
    }
    return this.prisma.holiday.findMany({
      where,
      orderBy: {
        holidayDate: 'asc',
      },
    })
  }

  async findOne(id: string) {
    const holiday = await this.prisma.holiday.findUnique({
      where: { id },
    })

    if (!holiday) {
      throw new NotFoundException('Holiday not found')
    }

    return holiday
  }

  async update(id: string, updateHolidayDto: UpdateHolidayDto) {
    const holiday = await this.prisma.holiday.findUnique({
      where: { id },
    })

    if (!holiday) {
      throw new NotFoundException('Holiday not found')
    }

    const updateData: any = { ...updateHolidayDto }
    if (updateHolidayDto.holidayDate) {
      updateData.holidayDate = new Date(updateHolidayDto.holidayDate)
      // Update year if date changed
      updateData.year = new Date(updateHolidayDto.holidayDate).getFullYear()
    }

    return this.prisma.holiday.update({
      where: { id },
      data: updateData,
    })
  }

  async remove(id: string) {
    const holiday = await this.prisma.holiday.findUnique({
      where: { id },
    })

    if (!holiday) {
      throw new NotFoundException('Holiday not found')
    }

    return this.prisma.holiday.delete({
      where: { id },
    })
  }

  async toggleActive(id: string) {
    const holiday = await this.prisma.holiday.findUnique({
      where: { id },
    })

    if (!holiday) {
      throw new NotFoundException('Holiday not found')
    }

    return this.prisma.holiday.update({
      where: { id },
      data: { isActive: !holiday.isActive },
    })
  }
}

