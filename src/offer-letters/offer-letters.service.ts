import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateOfferLetterDto } from './dto/create-offer-letter.dto'
import { UpdateOfferLetterDto } from './dto/update-offer-letter.dto'

@Injectable()
export class OfferLettersService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateOfferLetterDto) {
    // Verify candidate application exists
    const application = await this.prisma.candidateApplication.findUnique({
      where: { id: createDto.candidateApplicationId },
      include: {
        jobOpening: {
          include: {
            department: true,
            designation: true,
          },
        },
      },
    })

    if (!application) {
      throw new NotFoundException('Candidate application not found')
    }

    // Generate offer number
    const year = new Date().getFullYear()
    const count = await this.prisma.offerLetter.count({
      where: {
        offerDate: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
    })
    const offerNumber = `OFFER-${year}-${String(count + 1).padStart(3, '0')}`

    const offerLetter = await this.prisma.offerLetter.create({
      data: {
        offerNumber,
        candidateApplicationId: createDto.candidateApplicationId,
        offerDate: new Date(createDto.offerDate),
        joiningDate: new Date(createDto.joiningDate),
        salary: createDto.salary,
        currency: createDto.currency || 'INR',
        designation: createDto.designation,
        offerLetterUrl: createDto.offerLetterUrl,
        status: createDto.status || 'DRAFT',
        expiryDate: createDto.expiryDate ? new Date(createDto.expiryDate) : null,
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

    // Update candidate application status to OFFER_EXTENDED
    await this.prisma.candidateApplication.update({
      where: { id: createDto.candidateApplicationId },
      data: { status: 'OFFER_EXTENDED' },
    })

    return this.formatResponse(offerLetter)
  }

  async findAll(status?: string, search?: string) {
    const where: any = {}

    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    if (search) {
      where.OR = [
        { offerNumber: { contains: search, mode: 'insensitive' } },
        { candidateApplication: { candidateName: { contains: search, mode: 'insensitive' } } },
        { candidateApplication: { applicationNumber: { contains: search, mode: 'insensitive' } } },
        {
          candidateApplication: {
            jobOpening: { jobTitle: { contains: search, mode: 'insensitive' } },
          },
        },
      ]
    }

    const offerLetters = await this.prisma.offerLetter.findMany({
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
        offerDate: 'desc',
      },
    })

    return offerLetters.map(this.formatResponse)
  }

  async findOne(id: string) {
    const offerLetter = await this.prisma.offerLetter.findUnique({
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

    if (!offerLetter) {
      throw new NotFoundException('Offer letter not found')
    }

    return this.formatResponse(offerLetter)
  }

  async update(id: string, updateDto: UpdateOfferLetterDto) {
    const offerLetter = await this.prisma.offerLetter.findUnique({
      where: { id },
    })

    if (!offerLetter) {
      throw new NotFoundException('Offer letter not found')
    }

    const updateData: any = {}

    if (updateDto.offerDate) updateData.offerDate = new Date(updateDto.offerDate)
    if (updateDto.joiningDate) updateData.joiningDate = new Date(updateDto.joiningDate)
    if (updateDto.salary !== undefined) updateData.salary = updateDto.salary
    if (updateDto.currency) updateData.currency = updateDto.currency
    if (updateDto.designation) updateData.designation = updateDto.designation
    if (updateDto.offerLetterUrl !== undefined) updateData.offerLetterUrl = updateDto.offerLetterUrl
    if (updateDto.status) updateData.status = updateDto.status
    if (updateDto.expiryDate) updateData.expiryDate = new Date(updateDto.expiryDate)
    if (updateDto.notes !== undefined) updateData.notes = updateDto.notes
    if (updateDto.sentDate) updateData.sentDate = new Date(updateDto.sentDate)
    if (updateDto.acceptedDate) {
      updateData.acceptedDate = new Date(updateDto.acceptedDate)
      // Update candidate application status to HIRED when offer is accepted
      await this.prisma.candidateApplication.update({
        where: { id: offerLetter.candidateApplicationId },
        data: { status: 'HIRED' },
      })
    }
    if (updateDto.rejectedDate) updateData.rejectedDate = new Date(updateDto.rejectedDate)

    const updated = await this.prisma.offerLetter.update({
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
    const offerLetter = await this.prisma.offerLetter.findUnique({
      where: { id },
    })

    if (!offerLetter) {
      throw new NotFoundException('Offer letter not found')
    }

    await this.prisma.offerLetter.delete({
      where: { id },
    })
  }

  private formatResponse(offerLetter: any) {
    return {
      id: offerLetter.id,
      offerNumber: offerLetter.offerNumber,
      candidateApplicationId: offerLetter.candidateApplicationId,
      candidateName: offerLetter.candidateApplication?.candidateName,
      applicationNumber: offerLetter.candidateApplication?.applicationNumber,
      jobTitle: offerLetter.candidateApplication?.jobOpening?.jobTitle,
      jobCode: offerLetter.candidateApplication?.jobOpening?.jobCode,
      department: offerLetter.candidateApplication?.jobOpening?.department?.name,
      designation: offerLetter.designation,
      offerDate: offerLetter.offerDate.toISOString().split('T')[0],
      joiningDate: offerLetter.joiningDate.toISOString().split('T')[0],
      salary: offerLetter.salary,
      currency: offerLetter.currency,
      offerLetterUrl: offerLetter.offerLetterUrl,
      status: offerLetter.status,
      sentDate: offerLetter.sentDate?.toISOString().split('T')[0],
      acceptedDate: offerLetter.acceptedDate?.toISOString().split('T')[0],
      rejectedDate: offerLetter.rejectedDate?.toISOString().split('T')[0],
      expiryDate: offerLetter.expiryDate?.toISOString().split('T')[0],
      notes: offerLetter.notes,
      createdAt: offerLetter.createdAt.toISOString(),
      updatedAt: offerLetter.updatedAt.toISOString(),
    }
  }
}
