import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateKpiDto } from './dto/create-kpi.dto'
import { UpdateKpiDto } from './dto/update-kpi.dto'

@Injectable()
export class KpisService {
  constructor(private prisma: PrismaService) {}

  async create(createKpiDto: CreateKpiDto) {
    // Check if KPI code already exists
    const existing = await this.prisma.kPI.findUnique({
      where: { kpiCode: createKpiDto.kpiCode },
    })

    if (existing) {
      throw new ConflictException('KPI code already exists')
    }

    const kpi = await this.prisma.kPI.create({
      data: {
        kpiName: createKpiDto.kpiName,
        kpiCode: createKpiDto.kpiCode,
        category: createKpiDto.category,
        description: createKpiDto.description,
        measurementUnit: createKpiDto.measurementUnit,
        targetValue: createKpiDto.targetValue,
        weightage: createKpiDto.weightage,
        frequency: createKpiDto.frequency,
        department: createKpiDto.department,
        designation: createKpiDto.designation,
        isActive: createKpiDto.isActive ?? true,
      },
    })

    return this.formatResponse(kpi)
  }

  async findAll(category?: string, frequency?: string, search?: string) {
    const where: any = {}

    if (category && category !== 'all') {
      where.category = category
    }

    if (frequency && frequency !== 'all') {
      where.frequency = frequency.toUpperCase()
    }

    if (search) {
      where.OR = [
        { kpiName: { contains: search, mode: 'insensitive' } },
        { kpiCode: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const kpis = await this.prisma.kPI.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return kpis.map(kpi => this.formatResponse(kpi))
  }

  async findOne(id: string) {
    const kpi = await this.prisma.kPI.findUnique({
      where: { id },
      include: {
        assignments: {
          include: {
            employeeMaster: true,
          },
        },
      },
    })

    if (!kpi) {
      throw new NotFoundException('KPI not found')
    }

    return this.formatResponse(kpi)
  }

  async update(id: string, updateKpiDto: UpdateKpiDto) {
    const kpi = await this.prisma.kPI.findUnique({
      where: { id },
    })

    if (!kpi) {
      throw new NotFoundException('KPI not found')
    }

    // Check if KPI code is being updated and if it conflicts
    if (updateKpiDto.kpiCode && updateKpiDto.kpiCode !== kpi.kpiCode) {
      const existing = await this.prisma.kPI.findUnique({
        where: { kpiCode: updateKpiDto.kpiCode },
      })

      if (existing) {
        throw new ConflictException('KPI code already exists')
      }
    }

    const updated = await this.prisma.kPI.update({
      where: { id },
      data: updateKpiDto,
    })

    return this.formatResponse(updated)
  }

  async remove(id: string) {
    const kpi = await this.prisma.kPI.findUnique({
      where: { id },
    })

    if (!kpi) {
      throw new NotFoundException('KPI not found')
    }

    await this.prisma.kPI.delete({
      where: { id },
    })

    return { message: 'KPI deleted successfully' }
  }

  private formatResponse(kpi: any) {
    return {
      id: kpi.id,
      kpiName: kpi.kpiName,
      kpiCode: kpi.kpiCode,
      category: kpi.category,
      description: kpi.description,
      measurementUnit: kpi.measurementUnit,
      targetValue: kpi.targetValue,
      weightage: kpi.weightage,
      frequency: kpi.frequency,
      department: kpi.department,
      designation: kpi.designation,
      isActive: kpi.isActive,
      createdDate: kpi.createdAt.toISOString().split('T')[0],
      createdAt: kpi.createdAt.toISOString(),
      updatedAt: kpi.updatedAt.toISOString(),
    }
  }
}

