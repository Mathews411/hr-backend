import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateCandidateOnboardingDto } from './dto/create-candidate-onboarding.dto'
import { UpdateCandidateOnboardingDto } from './dto/update-candidate-onboarding.dto'

@Injectable()
export class CandidateOnboardingsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateCandidateOnboardingDto) {
    // Verify candidate application exists and has accepted offer
    const application = await this.prisma.candidateApplication.findUnique({
      where: { id: createDto.candidateApplicationId },
      include: {
        jobOpening: {
          include: {
            department: true,
            designation: true,
          },
        },
        offerLetter: true,
      },
    })

    if (!application) {
      throw new NotFoundException('Candidate application not found')
    }

    if (application.status !== 'HIRED' && !application.offerLetter) {
      throw new NotFoundException('Candidate must have accepted offer before onboarding')
    }

    const onboarding = await this.prisma.candidateOnboarding.create({
      data: {
        candidateApplicationId: createDto.candidateApplicationId,
        offerAcceptedDate: new Date(createDto.offerAcceptedDate),
        joiningDate: new Date(createDto.joiningDate),
        employeeId: createDto.employeeId,
        employeeCode: createDto.employeeCode,
        onboardingStatus: createDto.onboardingStatus || 'PENDING',
        currentStep: createDto.currentStep || 1,
        totalSteps: createDto.totalSteps || 5,
        documentsSubmitted: createDto.documentsSubmitted || 0,
        totalDocuments: createDto.totalDocuments || 6,
        notes: createDto.notes,
      },
      include: {
        candidateApplication: {
          include: {
            jobOpening: {
              include: {
                department: true,
                designation: true,
              },
            },
          },
        },
      },
    })

    return this.formatResponse(onboarding)
  }

  async findAll(status?: string, search?: string) {
    const where: any = {}

    if (status && status !== 'all') {
      where.onboardingStatus = status.toUpperCase().replace(' ', '_')
    }

    if (search) {
      where.OR = [
        { employeeCode: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
        { candidateApplication: { candidateName: { contains: search, mode: 'insensitive' } } },
        { candidateApplication: { applicationNumber: { contains: search, mode: 'insensitive' } } },
        {
          candidateApplication: {
            jobOpening: { jobTitle: { contains: search, mode: 'insensitive' } },
          },
        },
      ]
    }

    const onboardings = await this.prisma.candidateOnboarding.findMany({
      where,
      include: {
        candidateApplication: {
          include: {
            jobOpening: {
              include: {
                department: true,
                designation: true,
              },
            },
          },
        },
      },
      orderBy: {
        offerAcceptedDate: 'desc',
      },
    })

    return onboardings.map(this.formatResponse)
  }

  async findOne(id: string) {
    const onboarding = await this.prisma.candidateOnboarding.findUnique({
      where: { id },
      include: {
        candidateApplication: {
          include: {
            jobOpening: {
              include: {
                department: true,
                designation: true,
              },
            },
          },
        },
      },
    })

    if (!onboarding) {
      throw new NotFoundException('Candidate onboarding not found')
    }

    return this.formatResponse(onboarding)
  }

  async update(id: string, updateDto: UpdateCandidateOnboardingDto) {
    const onboarding = await this.prisma.candidateOnboarding.findUnique({
      where: { id },
    })

    if (!onboarding) {
      throw new NotFoundException('Candidate onboarding not found')
    }

    const updateData: any = {}

    if (updateDto.offerAcceptedDate) updateData.offerAcceptedDate = new Date(updateDto.offerAcceptedDate)
    if (updateDto.joiningDate) updateData.joiningDate = new Date(updateDto.joiningDate)
    if (updateDto.employeeId !== undefined) updateData.employeeId = updateDto.employeeId
    if (updateDto.employeeCode !== undefined) updateData.employeeCode = updateDto.employeeCode
    if (updateDto.onboardingStatus) updateData.onboardingStatus = updateDto.onboardingStatus
    if (updateDto.currentStep !== undefined) updateData.currentStep = updateDto.currentStep
    if (updateDto.totalSteps !== undefined) updateData.totalSteps = updateDto.totalSteps
    if (updateDto.documentsSubmitted !== undefined) updateData.documentsSubmitted = updateDto.documentsSubmitted
    if (updateDto.totalDocuments !== undefined) updateData.totalDocuments = updateDto.totalDocuments
    if (updateDto.notes !== undefined) updateData.notes = updateDto.notes
    if (updateDto.completedDate) {
      updateData.completedDate = new Date(updateDto.completedDate)
      updateData.onboardingStatus = 'COMPLETED'
    }

    const updated = await this.prisma.candidateOnboarding.update({
      where: { id },
      data: updateData,
      include: {
        candidateApplication: {
          include: {
            jobOpening: {
              include: {
                department: true,
                designation: true,
              },
            },
          },
        },
      },
    })

    return this.formatResponse(updated)
  }

  async remove(id: string) {
    const onboarding = await this.prisma.candidateOnboarding.findUnique({
      where: { id },
    })

    if (!onboarding) {
      throw new NotFoundException('Candidate onboarding not found')
    }

    await this.prisma.candidateOnboarding.delete({
      where: { id },
    })
  }

  private formatResponse(onboarding: any) {
    return {
      id: onboarding.id,
      candidateApplicationId: onboarding.candidateApplicationId,
      candidateName: onboarding.candidateApplication?.candidateName,
      applicationNumber: onboarding.candidateApplication?.applicationNumber,
      employeeId: onboarding.employeeId,
      employeeCode: onboarding.employeeCode,
      jobTitle: onboarding.candidateApplication?.jobOpening?.jobTitle,
      jobCode: onboarding.candidateApplication?.jobOpening?.jobCode,
      department: onboarding.candidateApplication?.jobOpening?.department?.name,
      designation: onboarding.candidateApplication?.jobOpening?.designation?.name,
      offerAcceptedDate: onboarding.offerAcceptedDate.toISOString().split('T')[0],
      joiningDate: onboarding.joiningDate.toISOString().split('T')[0],
      onboardingStatus: onboarding.onboardingStatus,
      currentStep: onboarding.currentStep,
      totalSteps: onboarding.totalSteps,
      documentsSubmitted: onboarding.documentsSubmitted,
      totalDocuments: onboarding.totalDocuments,
      notes: onboarding.notes,
      completedDate: onboarding.completedDate?.toISOString().split('T')[0],
      createdAt: onboarding.createdAt.toISOString(),
      updatedAt: onboarding.updatedAt.toISOString(),
    }
  }
}
