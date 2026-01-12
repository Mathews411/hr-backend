import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreatePromotionRecommendationDto } from './dto/create-promotion-recommendation.dto'
import { UpdatePromotionRecommendationDto } from './dto/update-promotion-recommendation.dto'

@Injectable()
export class PromotionRecommendationsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreatePromotionRecommendationDto) {
    const employee = await this.prisma.employeeMaster.findUnique({
      where: { id: createDto.employeeMasterId },
    })

    if (!employee) {
      throw new NotFoundException('Employee not found')
    }

    const recommendation = await this.prisma.promotionRecommendation.create({
      data: {
        employeeMasterId: createDto.employeeMasterId,
        currentDepartment: createDto.currentDepartment,
        currentDesignation: createDto.currentDesignation,
        recommendedDepartment: createDto.recommendedDepartment,
        recommendedDesignation: createDto.recommendedDesignation,
        currentSalary: createDto.currentSalary,
        recommendedSalary: createDto.recommendedSalary,
        recommendationReason: createDto.recommendationReason,
        performanceScore: createDto.performanceScore,
        yearsInCurrentRole: createDto.yearsInCurrentRole,
        status: createDto.status || 'PENDING',
        recommendationDate: new Date(),
      },
      include: {
        employeeMaster: true,
      },
    })

    return this.formatResponse(recommendation)
  }

  async findAll(status?: string, search?: string) {
    const where: any = {}

    if (status && status !== 'all') {
      where.status = status.toUpperCase().replace(' ', '_')
    }

    if (search) {
      where.OR = [
        { employeeMaster: { firstName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { lastName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { employeeCode: { contains: search, mode: 'insensitive' } } },
        { currentDesignation: { contains: search, mode: 'insensitive' } },
        { recommendedDesignation: { contains: search, mode: 'insensitive' } },
      ]
    }

    const recommendations = await this.prisma.promotionRecommendation.findMany({
      where,
      include: {
        employeeMaster: true,
      },
      orderBy: { recommendationDate: 'desc' },
    })

    return recommendations.map(rec => this.formatResponse(rec))
  }

  async findOne(id: string) {
    const recommendation = await this.prisma.promotionRecommendation.findUnique({
      where: { id },
      include: {
        employeeMaster: true,
      },
    })

    if (!recommendation) {
      throw new NotFoundException('Promotion recommendation not found')
    }

    return this.formatResponse(recommendation)
  }

  async update(id: string, updateDto: UpdatePromotionRecommendationDto) {
    const recommendation = await this.prisma.promotionRecommendation.findUnique({
      where: { id },
    })

    if (!recommendation) {
      throw new NotFoundException('Promotion recommendation not found')
    }

    const updateData: any = { ...updateDto }
    
    if (updateDto.approvedDate) {
      updateData.approvedDate = new Date(updateDto.approvedDate)
    }

    const updated = await this.prisma.promotionRecommendation.update({
      where: { id },
      data: updateData,
      include: {
        employeeMaster: true,
      },
    })

    return this.formatResponse(updated)
  }

  async remove(id: string) {
    const recommendation = await this.prisma.promotionRecommendation.findUnique({
      where: { id },
    })

    if (!recommendation) {
      throw new NotFoundException('Promotion recommendation not found')
    }

    await this.prisma.promotionRecommendation.delete({
      where: { id },
    })

    return { message: 'Promotion recommendation deleted successfully' }
  }

  private formatResponse(recommendation: any) {
    return {
      id: recommendation.id,
      employeeId: recommendation.employeeMasterId,
      employeeName: `${recommendation.employeeMaster?.firstName || ''} ${recommendation.employeeMaster?.lastName || ''}`.trim(),
      employeeCode: recommendation.employeeMaster?.employeeCode,
      currentDepartment: recommendation.currentDepartment,
      currentDesignation: recommendation.currentDesignation,
      recommendedDepartment: recommendation.recommendedDepartment,
      recommendedDesignation: recommendation.recommendedDesignation,
      currentSalary: recommendation.currentSalary,
      recommendedSalary: recommendation.recommendedSalary,
      recommendationReason: recommendation.recommendationReason,
      performanceScore: recommendation.performanceScore,
      yearsInCurrentRole: recommendation.yearsInCurrentRole,
      recommendedBy: recommendation.recommendedBy,
      recommendationDate: recommendation.recommendationDate.toISOString().split('T')[0],
      status: recommendation.status,
      approvedBy: recommendation.approvedBy,
      approvedDate: recommendation.approvedDate?.toISOString().split('T')[0],
      rejectionReason: recommendation.rejectionReason,
      createdAt: recommendation.createdAt.toISOString(),
      updatedAt: recommendation.updatedAt.toISOString(),
    }
  }
}

