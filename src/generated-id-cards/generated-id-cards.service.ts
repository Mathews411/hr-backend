import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateGeneratedIDCardDto } from './dto/create-generated-id-card.dto'
import { UpdateGeneratedIDCardDto } from './dto/update-generated-id-card.dto'

@Injectable()
export class GeneratedIDCardsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateGeneratedIDCardDto) {
    const employee = await this.prisma.employeeMaster.findUnique({
      where: { id: createDto.employeeMasterId },
    })
    if (!employee) {
      throw new NotFoundException('Employee not found')
    }

    // Get department and designation names
    let departmentName = ''
    let designationName = ''

    if (employee.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: employee.departmentId },
      })
      departmentName = department?.departmentName || ''
    }

    if (employee.designationId) {
      const designation = await this.prisma.designation.findUnique({
        where: { id: employee.designationId },
      })
      designationName = designation?.designationName || ''
    }

    const template = await this.prisma.iDCardTemplate.findUnique({
      where: { id: createDto.templateId },
    })
    if (!template) {
      throw new NotFoundException('ID Card template not found')
    }

    const qrCode = createDto.qrCode || `EMP-${employee.employeeCode}`

    const card = await this.prisma.generatedIDCard.create({
      data: {
        employeeMasterId: createDto.employeeMasterId,
        templateId: createDto.templateId,
        photoUrl: createDto.photoUrl,
        issueDate: createDto.issueDate ? new Date(createDto.issueDate) : new Date(),
        expiryDate: createDto.expiryDate ? new Date(createDto.expiryDate) : null,
        qrCode,
      },
      include: {
        employeeMaster: true,
        template: true,
      },
    })

    return this.formatResponse(card, departmentName, designationName)
  }

  async findAll(employeeMasterId?: string, status?: string, search?: string) {
    const where: any = {}
    if (employeeMasterId) where.employeeMasterId = employeeMasterId
    if (status) where.status = status
    if (search) {
      where.OR = [
        { employeeMaster: { firstName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { lastName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { employeeCode: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const cards = await this.prisma.generatedIDCard.findMany({
      where,
      include: {
        employeeMaster: true,
        template: true,
      },
      orderBy: { issueDate: 'desc' },
    })

    // Fetch department and designation for each card
    const formattedCards = await Promise.all(
      cards.map(async (c) => {
        let departmentName = ''
        let designationName = ''

        if (c.employeeMaster.departmentId) {
          const department = await this.prisma.department.findUnique({
            where: { id: c.employeeMaster.departmentId },
          })
          departmentName = department?.departmentName || ''
        }

        if (c.employeeMaster.designationId) {
          const designation = await this.prisma.designation.findUnique({
            where: { id: c.employeeMaster.designationId },
          })
          designationName = designation?.designationName || ''
        }

        return this.formatResponse(c, departmentName, designationName)
      })
    )

    return formattedCards
  }

  async findOne(id: string) {
    const card = await this.prisma.generatedIDCard.findUnique({
      where: { id },
      include: {
        employeeMaster: true,
        template: true,
      },
    })

    if (!card) {
      throw new NotFoundException('Generated ID Card not found')
    }

    // Get department and designation names
    let departmentName = ''
    let designationName = ''

    if (card.employeeMaster.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: card.employeeMaster.departmentId },
      })
      departmentName = department?.departmentName || ''
    }

    if (card.employeeMaster.designationId) {
      const designation = await this.prisma.designation.findUnique({
        where: { id: card.employeeMaster.designationId },
      })
      designationName = designation?.designationName || ''
    }

    return this.formatResponse(card, departmentName, designationName)
  }

  async update(id: string, updateDto: UpdateGeneratedIDCardDto) {
    const card = await this.prisma.generatedIDCard.findUnique({ where: { id } })
    if (!card) {
      throw new NotFoundException('Generated ID Card not found')
    }

    const updated = await this.prisma.generatedIDCard.update({
      where: { id },
      data: {
        templateId: updateDto.templateId,
        photoUrl: updateDto.photoUrl,
        expiryDate: updateDto.expiryDate ? new Date(updateDto.expiryDate) : undefined,
        status: updateDto.status,
        printedDate: updateDto.printedDate ? new Date(updateDto.printedDate) : undefined,
        printedBy: updateDto.printedBy,
      },
      include: {
        employeeMaster: true,
        template: true,
      },
    })

    // Get department and designation names
    let departmentName = ''
    let designationName = ''

    if (updated.employeeMaster.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: updated.employeeMaster.departmentId },
      })
      departmentName = department?.departmentName || ''
    }

    if (updated.employeeMaster.designationId) {
      const designation = await this.prisma.designation.findUnique({
        where: { id: updated.employeeMaster.designationId },
      })
      designationName = designation?.designationName || ''
    }

    return this.formatResponse(updated, departmentName, designationName)
  }

  async remove(id: string) {
    const card = await this.prisma.generatedIDCard.findUnique({ where: { id } })
    if (!card) {
      throw new NotFoundException('Generated ID Card not found')
    }
    await this.prisma.generatedIDCard.delete({ where: { id } })
  }

  private formatResponse(card: any, departmentName: string = '', designationName: string = '') {
    return {
      id: card.id,
      employeeId: card.employeeMasterId,
      employeeCode: card.employeeMaster.employeeCode,
      employeeName: `${card.employeeMaster.firstName} ${card.employeeMaster.lastName}`,
      departmentName,
      designationName,
      templateId: card.templateId,
      templateName: card.template.templateName,
      photoUrl: card.photoUrl,
      issueDate: card.issueDate.toISOString().split('T')[0],
      expiryDate: card.expiryDate ? card.expiryDate.toISOString().split('T')[0] : null,
      status: card.status === 'ACTIVE' ? 'Active' :
              card.status === 'EXPIRED' ? 'Expired' : 'Cancelled',
      qrCode: card.qrCode,
      printedDate: card.printedDate ? card.printedDate.toISOString().split('T')[0] : null,
      printedBy: card.printedBy,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    }
  }
}

