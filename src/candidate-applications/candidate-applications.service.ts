import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateCandidateApplicationDto } from './dto/create-candidate-application.dto'
import { UpdateCandidateApplicationDto } from './dto/update-candidate-application.dto'

@Injectable()
export class CandidateApplicationsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateCandidateApplicationDto) {
    // Verify job opening exists
    const jobOpening = await this.prisma.jobOpening.findUnique({
      where: { id: createDto.jobOpeningId },
      include: {
        department: true,
      },
    })

    if (!jobOpening) {
      throw new NotFoundException('Job opening not found')
    }

    // Generate application number
    const year = new Date().getFullYear()
    const count = await this.prisma.candidateApplication.count({
      where: {
        appliedDate: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
    })
    const applicationNumber = `APP-${year}-${String(count + 1).padStart(3, '0')}`

    const application = await this.prisma.candidateApplication.create({
      data: {
        candidateName: createDto.candidateName,
        email: createDto.email,
        phone: createDto.phone,
        jobOpeningId: createDto.jobOpeningId,
        applicationNumber,
        experience: createDto.experience,
        currentLocation: createDto.currentLocation,
        resumeUrl: createDto.resumeUrl,
        coverLetter: createDto.coverLetter,
        education: createDto.education,
        skills: createDto.skills,
        expectedSalary: createDto.expectedSalary,
        noticePeriod: createDto.noticePeriod,
        status: 'APPLIED',
        appliedDate: new Date(),
      },
      include: {
        jobOpening: {
          include: {
            department: true,
          },
        },
      },
    })

    return this.formatResponse(application)
  }

  async findAll(
    status?: string,
    jobId?: string,
    jobCode?: string,
    startDate?: string,
    endDate?: string,
    search?: string,
  ) {
    const where: any = {}

    if (status) {
      where.status = status.toUpperCase()
    }

    if (jobId) {
      where.jobOpeningId = jobId
    }

    if (jobCode) {
      const job = await this.prisma.jobOpening.findUnique({
        where: { jobCode },
      })
      if (job) {
        where.jobOpeningId = job.id
      } else {
        return []
      }
    }

    if (startDate || endDate) {
      where.appliedDate = {}
      if (startDate) {
        where.appliedDate.gte = new Date(startDate)
      }
      if (endDate) {
        where.appliedDate.lte = new Date(endDate)
      }
    }

    if (search) {
      where.OR = [
        { candidateName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { applicationNumber: { contains: search, mode: 'insensitive' } },
      ]
    }

    const applications = await this.prisma.candidateApplication.findMany({
      where,
      include: {
        jobOpening: {
          include: {
            department: true,
          },
        },
      },
      orderBy: {
        appliedDate: 'desc',
      },
    })

    return applications.map((app) => this.formatResponse(app))
  }

  async findOne(id: string) {
    const application = await this.prisma.candidateApplication.findUnique({
      where: { id },
      include: {
        jobOpening: {
          include: {
            department: true,
          },
        },
      },
    })

    if (!application) {
      throw new NotFoundException('Candidate application not found')
    }

    return this.formatResponse(application)
  }

  async update(id: string, updateDto: UpdateCandidateApplicationDto) {
    const application = await this.prisma.candidateApplication.findUnique({
      where: { id },
    })

    if (!application) {
      throw new NotFoundException('Candidate application not found')
    }

    const updateData: any = { ...updateDto }
    
    // Convert screeningScore to number if it's a string
    if (updateDto.screeningScore !== undefined && updateDto.screeningScore !== null) {
      updateData.screeningScore = typeof updateDto.screeningScore === 'string' 
        ? Number(updateDto.screeningScore) 
        : updateDto.screeningScore
    }
    
    // Handle screenedDate if provided as string
    if (updateDto.screenedDate && typeof updateDto.screenedDate === 'string') {
      updateData.screenedDate = new Date(updateDto.screenedDate)
    }

    const updated = await this.prisma.candidateApplication.update({
      where: { id },
      data: updateData,
      include: {
        jobOpening: {
          include: {
            department: true,
          },
        },
      },
    })

    return this.formatResponse(updated)
  }

  async remove(id: string) {
    const application = await this.prisma.candidateApplication.findUnique({
      where: { id },
    })

    if (!application) {
      throw new NotFoundException('Candidate application not found')
    }

    await this.prisma.candidateApplication.delete({
      where: { id },
    })
  }

  private formatResponse(application: any) {
    return {
      id: application.id,
      applicationNumber: application.applicationNumber,
      candidateName: application.candidateName,
      email: application.email,
      phone: application.phone,
      jobOpeningId: application.jobOpeningId,
      jobTitle: application.jobOpening?.jobTitle,
      jobCode: application.jobOpening?.jobCode,
      department: application.jobOpening?.department?.departmentName,
      appliedDate: application.appliedDate.toISOString().split('T')[0],
      status: application.status,
      experience: application.experience,
      currentLocation: application.currentLocation,
      resumeUrl: application.resumeUrl,
      coverLetter: application.coverLetter,
      education: application.education,
      skills: application.skills,
      expectedSalary: application.expectedSalary,
      noticePeriod: application.noticePeriod,
      screeningScore: application.screeningScore,
      screeningNotes: application.screeningNotes,
      screenedBy: application.screenedBy,
      screenedDate: application.screenedDate ? application.screenedDate.toISOString().split('T')[0] : null,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    }
  }
}

