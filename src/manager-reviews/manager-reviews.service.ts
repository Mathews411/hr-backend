import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateManagerReviewDto } from './dto/create-manager-review.dto'
import { UpdateManagerReviewDto } from './dto/update-manager-review.dto'

@Injectable()
export class ManagerReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateManagerReviewDto) {
    const employee = await this.prisma.employeeMaster.findUnique({
      where: { id: createDto.employeeMasterId },
    })

    if (!employee) {
      throw new NotFoundException('Employee not found')
    }

    const manager = await this.prisma.employeeMaster.findUnique({
      where: { id: createDto.managerId },
    })

    if (!manager) {
      throw new NotFoundException('Manager not found')
    }

    const review = await this.prisma.managerReview.create({
      data: {
        employeeMasterId: createDto.employeeMasterId,
        managerId: createDto.managerId,
        reviewPeriod: createDto.reviewPeriod,
        overallRating: createDto.overallRating,
        technicalSkills: createDto.technicalSkills,
        communication: createDto.communication,
        teamwork: createDto.teamwork,
        leadership: createDto.leadership,
        problemSolving: createDto.problemSolving,
        strengths: createDto.strengths,
        areasForImprovement: createDto.areasForImprovement,
        goalsForNextPeriod: createDto.goalsForNextPeriod,
        comments: createDto.comments,
        status: createDto.status || 'DRAFT',
        submittedDate: createDto.submittedDate ? new Date(createDto.submittedDate) : null,
      },
      include: {
        employeeMaster: true,
        manager: true,
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
        { manager: { firstName: { contains: search, mode: 'insensitive' } } },
        { manager: { lastName: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const reviews = await this.prisma.managerReview.findMany({
      where,
      include: {
        employeeMaster: true,
        manager: true,
      },
      orderBy: { submittedDate: 'desc' },
    })

    return reviews.map(review => this.formatResponse(review))
  }

  async findOne(id: string) {
    const review = await this.prisma.managerReview.findUnique({
      where: { id },
      include: {
        employeeMaster: true,
        manager: true,
      },
    })

    if (!review) {
      throw new NotFoundException('Manager review not found')
    }

    return this.formatResponse(review)
  }

  async update(id: string, updateDto: UpdateManagerReviewDto) {
    const review = await this.prisma.managerReview.findUnique({
      where: { id },
    })

    if (!review) {
      throw new NotFoundException('Manager review not found')
    }

    const updateData: any = { ...updateDto }
    
    if (updateDto.submittedDate) {
      updateData.submittedDate = new Date(updateDto.submittedDate)
    }
    
    if (updateDto.approvedDate) {
      updateData.approvedDate = new Date(updateDto.approvedDate)
    }

    const updated = await this.prisma.managerReview.update({
      where: { id },
      data: updateData,
      include: {
        employeeMaster: true,
        manager: true,
      },
    })

    return this.formatResponse(updated)
  }

  async remove(id: string) {
    const review = await this.prisma.managerReview.findUnique({
      where: { id },
    })

    if (!review) {
      throw new NotFoundException('Manager review not found')
    }

    await this.prisma.managerReview.delete({
      where: { id },
    })

    return { message: 'Manager review deleted successfully' }
  }

  private formatResponse(review: any) {
    return {
      id: review.id,
      employeeId: review.employeeMasterId,
      employeeName: `${review.employeeMaster?.firstName || ''} ${review.employeeMaster?.lastName || ''}`.trim(),
      employeeCode: review.employeeMaster?.employeeCode,
      department: review.employeeMaster?.department?.departmentName || review.employeeMaster?.departmentId,
      designation: review.employeeMaster?.designation?.designationName || review.employeeMaster?.designationId,
      managerId: review.managerId,
      managerName: `${review.manager?.firstName || ''} ${review.manager?.lastName || ''}`.trim(),
      reviewPeriod: review.reviewPeriod,
      overallRating: review.overallRating,
      technicalSkills: review.technicalSkills,
      communication: review.communication,
      teamwork: review.teamwork,
      leadership: review.leadership,
      problemSolving: review.problemSolving,
      strengths: review.strengths,
      areasForImprovement: review.areasForImprovement,
      goalsForNextPeriod: review.goalsForNextPeriod,
      comments: review.comments,
      status: review.status,
      submittedDate: review.submittedDate?.toISOString().split('T')[0],
      approvedDate: review.approvedDate?.toISOString().split('T')[0],
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    }
  }
}

