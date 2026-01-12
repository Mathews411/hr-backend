import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateSelfReviewDto } from './dto/create-self-review.dto'
import { UpdateSelfReviewDto } from './dto/update-self-review.dto'

@Injectable()
export class SelfReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateSelfReviewDto) {
    const employee = await this.prisma.employeeMaster.findUnique({
      where: { id: createDto.employeeMasterId },
    })

    if (!employee) {
      throw new NotFoundException('Employee not found')
    }

    const review = await this.prisma.selfReview.create({
      data: {
        employeeMasterId: createDto.employeeMasterId,
        reviewPeriod: createDto.reviewPeriod,
        overallRating: createDto.overallRating,
        achievements: createDto.achievements,
        challenges: createDto.challenges,
        skillsLearned: createDto.skillsLearned,
        goalsAchieved: createDto.goalsAchieved,
        goalsForNextPeriod: createDto.goalsForNextPeriod,
        supportNeeded: createDto.supportNeeded,
        status: createDto.status || 'DRAFT',
        submittedDate: createDto.submittedDate ? new Date(createDto.submittedDate) : null,
      },
      include: {
        employeeMaster: true,
      },
    })

    return this.formatResponse(review)
  }

  async findAll(status?: string, search?: string) {
    const where: any = {}

    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    if (search) {
      where.OR = [
        { employeeMaster: { firstName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { lastName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { employeeCode: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const reviews = await this.prisma.selfReview.findMany({
      where,
      include: {
        employeeMaster: true,
      },
      orderBy: { submittedDate: 'desc' },
    })

    return reviews.map(review => this.formatResponse(review))
  }

  async findOne(id: string) {
    const review = await this.prisma.selfReview.findUnique({
      where: { id },
      include: {
        employeeMaster: true,
      },
    })

    if (!review) {
      throw new NotFoundException('Self review not found')
    }

    return this.formatResponse(review)
  }

  async update(id: string, updateDto: UpdateSelfReviewDto) {
    const review = await this.prisma.selfReview.findUnique({
      where: { id },
    })

    if (!review) {
      throw new NotFoundException('Self review not found')
    }

    const updateData: any = { ...updateDto }
    
    if (updateDto.submittedDate) {
      updateData.submittedDate = new Date(updateDto.submittedDate)
    }
    
    if (updateDto.reviewedDate) {
      updateData.reviewedDate = new Date(updateDto.reviewedDate)
    }

    const updated = await this.prisma.selfReview.update({
      where: { id },
      data: updateData,
      include: {
        employeeMaster: true,
      },
    })

    return this.formatResponse(updated)
  }

  async remove(id: string) {
    const review = await this.prisma.selfReview.findUnique({
      where: { id },
    })

    if (!review) {
      throw new NotFoundException('Self review not found')
    }

    await this.prisma.selfReview.delete({
      where: { id },
    })

    return { message: 'Self review deleted successfully' }
  }

  private formatResponse(review: any) {
    return {
      id: review.id,
      employeeId: review.employeeMasterId,
      employeeName: `${review.employeeMaster?.firstName || ''} ${review.employeeMaster?.lastName || ''}`.trim(),
      employeeCode: review.employeeMaster?.employeeCode,
      department: review.employeeMaster?.department?.departmentName || review.employeeMaster?.departmentId,
      designation: review.employeeMaster?.designation?.designationName || review.employeeMaster?.designationId,
      reviewPeriod: review.reviewPeriod,
      overallRating: review.overallRating,
      achievements: review.achievements,
      challenges: review.challenges,
      skillsLearned: review.skillsLearned,
      goalsAchieved: review.goalsAchieved,
      goalsForNextPeriod: review.goalsForNextPeriod,
      supportNeeded: review.supportNeeded,
      status: review.status,
      submittedDate: review.submittedDate?.toISOString().split('T')[0],
      reviewedDate: review.reviewedDate?.toISOString().split('T')[0],
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    }
  }
}

