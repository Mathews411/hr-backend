import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateAppraisalCycleDto } from './dto/create-appraisal-cycle.dto'
import { UpdateAppraisalCycleDto } from './dto/update-appraisal-cycle.dto'

@Injectable()
export class AppraisalCyclesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateAppraisalCycleDto) {
    // Check if cycle code already exists
    const existing = await this.prisma.appraisalCycle.findUnique({
      where: { cycleCode: createDto.cycleCode },
    })

    if (existing) {
      throw new ConflictException('Appraisal cycle code already exists')
    }

    const cycle = await this.prisma.appraisalCycle.create({
      data: {
        cycleName: createDto.cycleName,
        cycleCode: createDto.cycleCode,
        startDate: new Date(createDto.startDate),
        endDate: new Date(createDto.endDate),
        evaluationPeriod: createDto.evaluationPeriod,
        status: createDto.status || 'PLANNING',
        selfReviewDeadline: createDto.selfReviewDeadline ? new Date(createDto.selfReviewDeadline) : null,
        managerReviewDeadline: createDto.managerReviewDeadline ? new Date(createDto.managerReviewDeadline) : null,
        finalReviewDeadline: createDto.finalReviewDeadline ? new Date(createDto.finalReviewDeadline) : null,
        totalEmployees: 0,
        completedEvaluations: 0,
        pendingEvaluations: 0,
      },
    })

    return this.formatResponse(cycle)
  }

  async findAll(status?: string, search?: string) {
    const where: any = {}

    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    if (search) {
      where.OR = [
        { cycleName: { contains: search, mode: 'insensitive' } },
        { cycleCode: { contains: search, mode: 'insensitive' } },
        { evaluationPeriod: { contains: search, mode: 'insensitive' } },
      ]
    }

    const cycles = await this.prisma.appraisalCycle.findMany({
      where,
      orderBy: { startDate: 'desc' },
    })

    return cycles.map(cycle => this.formatResponse(cycle))
  }

  async findOne(id: string) {
    const cycle = await this.prisma.appraisalCycle.findUnique({
      where: { id },
    })

    if (!cycle) {
      throw new NotFoundException('Appraisal cycle not found')
    }

    return this.formatResponse(cycle)
  }

  async update(id: string, updateDto: UpdateAppraisalCycleDto) {
    const cycle = await this.prisma.appraisalCycle.findUnique({
      where: { id },
    })

    if (!cycle) {
      throw new NotFoundException('Appraisal cycle not found')
    }

    // Check if cycle code is being updated and if it conflicts
    if (updateDto.cycleCode && updateDto.cycleCode !== cycle.cycleCode) {
      const existing = await this.prisma.appraisalCycle.findUnique({
        where: { cycleCode: updateDto.cycleCode },
      })

      if (existing) {
        throw new ConflictException('Appraisal cycle code already exists')
      }
    }

    const updateData: any = { ...updateDto }
    
    if (updateDto.startDate) {
      updateData.startDate = new Date(updateDto.startDate)
    }
    
    if (updateDto.endDate) {
      updateData.endDate = new Date(updateDto.endDate)
    }
    
    if (updateDto.selfReviewDeadline) {
      updateData.selfReviewDeadline = new Date(updateDto.selfReviewDeadline)
    }
    
    if (updateDto.managerReviewDeadline) {
      updateData.managerReviewDeadline = new Date(updateDto.managerReviewDeadline)
    }
    
    if (updateDto.finalReviewDeadline) {
      updateData.finalReviewDeadline = new Date(updateDto.finalReviewDeadline)
    }

    const updated = await this.prisma.appraisalCycle.update({
      where: { id },
      data: updateData,
    })

    return this.formatResponse(updated)
  }

  async remove(id: string) {
    const cycle = await this.prisma.appraisalCycle.findUnique({
      where: { id },
    })

    if (!cycle) {
      throw new NotFoundException('Appraisal cycle not found')
    }

    await this.prisma.appraisalCycle.delete({
      where: { id },
    })

    return { message: 'Appraisal cycle deleted successfully' }
  }

  private formatResponse(cycle: any) {
    return {
      id: cycle.id,
      cycleName: cycle.cycleName,
      cycleCode: cycle.cycleCode,
      startDate: cycle.startDate.toISOString().split('T')[0],
      endDate: cycle.endDate.toISOString().split('T')[0],
      evaluationPeriod: cycle.evaluationPeriod,
      status: cycle.status,
      totalEmployees: cycle.totalEmployees,
      completedEvaluations: cycle.completedEvaluations,
      pendingEvaluations: cycle.pendingEvaluations,
      selfReviewDeadline: cycle.selfReviewDeadline?.toISOString().split('T')[0],
      managerReviewDeadline: cycle.managerReviewDeadline?.toISOString().split('T')[0],
      finalReviewDeadline: cycle.finalReviewDeadline?.toISOString().split('T')[0],
      createdDate: cycle.createdAt.toISOString().split('T')[0],
      createdAt: cycle.createdAt.toISOString(),
      updatedAt: cycle.updatedAt.toISOString(),
    }
  }
}

