import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateInterviewDto } from './dto/create-interview.dto'
import { UpdateInterviewDto } from './dto/update-interview.dto'

@Injectable()
export class InterviewsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateInterviewDto) {
    // Verify candidate application exists
    const application = await this.prisma.candidateApplication.findUnique({
      where: { id: createDto.candidateApplicationId },
      include: {
        jobOpening: {
          select: {
            jobTitle: true,
            jobCode: true,
            department: true,
          },
        },
      },
    })

    if (!application) {
      throw new NotFoundException('Candidate application not found')
    }

    // Check if interview already exists for this round
    const existingInterview = await this.prisma.interview.findFirst({
      where: {
        candidateApplicationId: createDto.candidateApplicationId,
        roundNumber: createDto.roundNumber,
      },
    })

    if (existingInterview) {
      throw new BadRequestException(
        `Interview for round ${createDto.roundNumber} already exists for this application`,
      )
    }

    const interview = await this.prisma.interview.create({
      data: {
        candidateApplicationId: createDto.candidateApplicationId,
        roundNumber: createDto.roundNumber,
        roundType: createDto.roundType,
        interviewDate: new Date(createDto.interviewDate),
        interviewTime: createDto.interviewTime,
        interviewer: createDto.interviewer,
        location: createDto.location,
        mode: createDto.mode,
        status: createDto.status || 'SCHEDULED',
        notes: createDto.notes,
        feedback: createDto.feedback,
        rating: createDto.rating,
        technicalSkills: createDto.technicalSkills,
        communication: createDto.communication,
        problemSolving: createDto.problemSolving,
        culturalFit: createDto.culturalFit,
        strengths: createDto.strengths,
        weaknesses: createDto.weaknesses,
        recommendation: createDto.recommendation as any,
        feedbackStatus: createDto.feedbackStatus as any,
      },
      include: {
        candidateApplication: {
          include: {
            jobOpening: {
              select: {
                jobTitle: true,
                jobCode: true,
                department: true,
              },
            },
          },
        },
      },
    })

    // Update candidate application status to INTERVIEW_SCHEDULED if not already
    if (application.status !== 'INTERVIEW_SCHEDULED') {
      await this.prisma.candidateApplication.update({
        where: { id: createDto.candidateApplicationId },
        data: { status: 'INTERVIEW_SCHEDULED' },
      })
    }

    return this.formatResponse(interview)
  }

  async findAll(
    candidateApplicationId?: string,
    status?: string,
    roundType?: string,
    startDate?: string,
    endDate?: string,
    search?: string,
    feedbackStatus?: string,
    hasFeedback?: boolean,
  ) {
    const where: any = {}

    if (candidateApplicationId) {
      where.candidateApplicationId = candidateApplicationId
    }

    if (status) {
      where.status = status
    }

    if (roundType) {
      where.roundType = roundType
    }

    if (feedbackStatus) {
      where.feedbackStatus = feedbackStatus
    }

    if (startDate || endDate) {
      where.interviewDate = {}
      if (startDate) {
        where.interviewDate.gte = new Date(startDate)
      }
      if (endDate) {
        where.interviewDate.lte = new Date(new Date(endDate).setHours(23, 59, 59, 999))
      }
    }

    // Build AND conditions array for combining filters
    const andConditions: any[] = []

    // Handle search conditions
    if (search) {
      andConditions.push({
        OR: [
          { interviewer: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
          { candidateApplication: { candidateName: { contains: search, mode: 'insensitive' } } },
          { candidateApplication: { applicationNumber: { contains: search, mode: 'insensitive' } } },
          {
            candidateApplication: {
              jobOpening: { jobTitle: { contains: search, mode: 'insensitive' } },
            },
          },
        ]
      })
    }

    // Handle hasFeedback filter - this should be ANDed with other conditions
    if (hasFeedback !== undefined) {
      if (hasFeedback) {
        // Check if any feedback-related field is filled (OR condition)
        andConditions.push({
          OR: [
            { feedback: { not: null } },
            { rating: { not: null } },
            { technicalSkills: { not: null } },
            { communication: { not: null } },
            { problemSolving: { not: null } },
            { culturalFit: { not: null } },
            { strengths: { not: null } },
            { weaknesses: { not: null } },
            { recommendation: { not: null } }
          ]
        })
      } else {
        // If hasFeedback is false, we want interviews with no feedback
        andConditions.push({
          AND: [
            { feedback: null },
            { rating: null },
            { technicalSkills: null },
            { communication: null },
            { problemSolving: null },
            { culturalFit: null }
          ]
        })
      }
    }

    // Combine all AND conditions
    if (andConditions.length > 0) {
      if (andConditions.length === 1) {
        Object.assign(where, andConditions[0])
      } else {
        where.AND = andConditions
      }
    }

    const interviews = await this.prisma.interview.findMany({
      where,
      include: {
        candidateApplication: {
          include: {
            jobOpening: {
              select: {
                jobTitle: true,
                jobCode: true,
                department: true,
              },
            },
          },
        },
      },
      orderBy: {
        interviewDate: 'desc',
      },
    })

    return interviews.map(this.formatResponse)
  }

  async findOne(id: string) {
    const interview = await this.prisma.interview.findUnique({
      where: { id },
      include: {
        candidateApplication: {
          include: {
            jobOpening: {
              select: {
                jobTitle: true,
                jobCode: true,
                department: true,
              },
            },
          },
        },
      },
    })

    if (!interview) {
      throw new NotFoundException('Interview not found')
    }

    return this.formatResponse(interview)
  }

  async update(id: string, updateDto: UpdateInterviewDto) {
    const interview = await this.prisma.interview.findUnique({
      where: { id },
    })

    if (!interview) {
      throw new NotFoundException('Interview not found')
    }

    const updateData: any = { ...updateDto }

    // Handle interviewDate if provided as string
    if (updateDto.interviewDate && typeof updateDto.interviewDate === 'string') {
      updateData.interviewDate = new Date(updateDto.interviewDate)
    }

    const updated = await this.prisma.interview.update({
      where: { id },
      data: updateData,
      include: {
        candidateApplication: {
          include: {
            jobOpening: {
              select: {
                jobTitle: true,
                jobCode: true,
                department: true,
              },
            },
          },
        },
      },
    })

    return this.formatResponse(updated)
  }

  async remove(id: string) {
    const interview = await this.prisma.interview.findUnique({ where: { id } })
    if (!interview) {
      throw new NotFoundException('Interview not found')
    }
    await this.prisma.interview.delete({ where: { id } })
  }

  private formatResponse(interview: any) {
    return {
      id: interview.id,
      candidateApplicationId: interview.candidateApplicationId,
      candidateName: interview.candidateApplication?.candidateName || null,
      applicationNumber: interview.candidateApplication?.applicationNumber || null,
      jobTitle: interview.candidateApplication?.jobOpening?.jobTitle || null,
      jobCode: interview.candidateApplication?.jobOpening?.jobCode || null,
      department: interview.candidateApplication?.jobOpening?.department?.departmentName || null,
      roundNumber: interview.roundNumber,
      roundType: interview.roundType,
      interviewDate: interview.interviewDate.toISOString().split('T')[0],
      interviewTime: interview.interviewTime,
      interviewer: interview.interviewer,
      location: interview.location,
      mode: interview.mode,
      status: interview.status,
      notes: interview.notes,
      feedback: interview.feedback,
      rating: interview.rating,
      technicalSkills: interview.technicalSkills,
      communication: interview.communication,
      problemSolving: interview.problemSolving,
      culturalFit: interview.culturalFit,
      strengths: interview.strengths,
      weaknesses: interview.weaknesses,
      recommendation: interview.recommendation,
      feedbackStatus: interview.feedbackStatus,
      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt,
    }
  }
}

