import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateLeaveEncashmentDto } from './dto/create-leave-encashment.dto'
import { UpdateLeaveEncashmentDto } from './dto/update-leave-encashment.dto'
import { LeaveEncashmentStatus } from '@prisma/client'

@Injectable()
export class LeaveEncashmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateLeaveEncashmentDto) {
    // Verify employee exists
    const employee = await this.prisma.employeeMaster.findUnique({
      where: { id: createDto.employeeMasterId },
    })

    if (!employee) {
      throw new NotFoundException('Employee not found')
    }

    // Verify leave policy exists
    const leavePolicy = await this.prisma.leavePolicy.findUnique({
      where: { id: createDto.leavePolicyId },
    })

    if (!leavePolicy) {
      throw new NotFoundException('Leave policy not found')
    }

    // Check available leave balance
    const currentYear = new Date().getFullYear()
    const leaveBalance = await this.prisma.leaveBalance.findUnique({
      where: {
        employeeMasterId_leavePolicyId_year: {
          employeeMasterId: createDto.employeeMasterId,
          leavePolicyId: createDto.leavePolicyId,
          year: currentYear,
        },
      },
    })

    if (!leaveBalance || leaveBalance.available < createDto.daysToEncash) {
      throw new BadRequestException('Insufficient leave balance for encashment')
    }

    // Calculate encashment amount (assuming daily rate based on employee salary or fixed rate)
    // For now, using a fixed daily rate of 5000
    const dailyRate = 5000
    const encashmentAmount = createDto.daysToEncash * dailyRate

    // Generate request number
    const year = new Date().getFullYear()
    const count = await this.prisma.leaveEncashment.count({
      where: {
        requestDate: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
    })
    const requestNumber = `ENC-${year}-${String(count + 1).padStart(4, '0')}`

    const encashment = await this.prisma.leaveEncashment.create({
      data: {
        requestNumber,
        employeeMasterId: createDto.employeeMasterId,
        leavePolicyId: createDto.leavePolicyId,
        daysToEncash: createDto.daysToEncash,
        encashmentAmount,
        requestDate: new Date(),
        status: LeaveEncashmentStatus.PENDING,
      },
      include: {
        employeeMaster: true,
        leavePolicy: true,
      },
    })

    return this.formatResponse(encashment)
  }

  async findAll(employeeId?: string, status?: string, startDate?: string, endDate?: string, search?: string) {
    const where: any = {}

    if (employeeId) {
      where.employeeMasterId = employeeId
    }

    if (status) {
      where.status = status.toUpperCase() as LeaveEncashmentStatus
    }

    if (startDate || endDate) {
      where.requestDate = {}
      if (startDate) {
        where.requestDate.gte = new Date(startDate)
      }
      if (endDate) {
        where.requestDate.lte = new Date(endDate)
      }
    }

    if (search) {
      where.OR = [
        { requestNumber: { contains: search, mode: 'insensitive' } },
        { employeeMaster: { firstName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { lastName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { employeeCode: { contains: search, mode: 'insensitive' } } },
        { leavePolicy: { leaveType: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const encashments = await this.prisma.leaveEncashment.findMany({
      where,
      include: {
        employeeMaster: true,
        leavePolicy: true,
      },
      orderBy: {
        requestDate: 'desc',
      },
    })

    return encashments.map((enc) => this.formatResponse(enc))
  }

  async findOne(id: string) {
    const encashment = await this.prisma.leaveEncashment.findUnique({
      where: { id },
      include: {
        employeeMaster: true,
        leavePolicy: true,
      },
    })

    if (!encashment) {
      throw new NotFoundException('Leave encashment not found')
    }

    return this.formatResponse(encashment)
  }

  async update(id: string, updateDto: UpdateLeaveEncashmentDto) {
    const encashment = await this.prisma.leaveEncashment.findUnique({
      where: { id },
    })

    if (!encashment) {
      throw new NotFoundException('Leave encashment not found')
    }

    const updateData: any = {}

    if (updateDto.status) {
      updateData.status = updateDto.status
      if (updateDto.status === LeaveEncashmentStatus.APPROVED || updateDto.status === LeaveEncashmentStatus.PROCESSED) {
        updateData.approvedDate = new Date()
        if (updateDto.status === LeaveEncashmentStatus.PROCESSED) {
          updateData.processedDate = new Date()
        }
      }
    }

    if (updateDto.approvedBy) {
      updateData.approvedBy = updateDto.approvedBy
    }

    if (updateDto.rejectionReason) {
      updateData.rejectionReason = updateDto.rejectionReason
    }

    const updated = await this.prisma.leaveEncashment.update({
      where: { id },
      data: updateData,
      include: {
        employeeMaster: true,
        leavePolicy: true,
      },
    })

    return this.formatResponse(updated)
  }

  async approve(id: string, approvedBy?: string) {
    const encashment = await this.prisma.leaveEncashment.findUnique({ where: { id } })
    if (!encashment) throw new NotFoundException('Leave encashment not found')

    const updated = await this.prisma.leaveEncashment.update({
      where: { id },
      data: {
        status: LeaveEncashmentStatus.APPROVED,
        approvedBy: approvedBy || 'System/Manager',
        approvedDate: new Date(),
        rejectionReason: null,
      },
      include: { employeeMaster: true, leavePolicy: true },
    })
    return this.formatResponse(updated)
  }

  async reject(id: string, rejectionReason: string) {
    const encashment = await this.prisma.leaveEncashment.findUnique({ where: { id } })
    if (!encashment) throw new NotFoundException('Leave encashment not found')

    const updated = await this.prisma.leaveEncashment.update({
      where: { id },
      data: {
        status: LeaveEncashmentStatus.REJECTED,
        rejectionReason,
        approvedBy: 'System/Manager',
        approvedDate: new Date(),
      },
      include: { employeeMaster: true, leavePolicy: true },
    })
    return this.formatResponse(updated)
  }

  async process(id: string) {
    const encashment = await this.prisma.leaveEncashment.findUnique({ where: { id } })
    if (!encashment) throw new NotFoundException('Leave encashment not found')

    if (encashment.status !== LeaveEncashmentStatus.APPROVED) {
      throw new BadRequestException('Only approved encashments can be processed')
    }

    const updated = await this.prisma.leaveEncashment.update({
      where: { id },
      data: {
        status: LeaveEncashmentStatus.PROCESSED,
        processedDate: new Date(),
      },
      include: { employeeMaster: true, leavePolicy: true },
    })
    return this.formatResponse(updated)
  }

  async remove(id: string) {
    const encashment = await this.prisma.leaveEncashment.findUnique({
      where: { id },
    })

    if (!encashment) {
      throw new NotFoundException('Leave encashment not found')
    }

    await this.prisma.leaveEncashment.delete({
      where: { id },
    })
  }

  private formatResponse(encashment: any) {
    return {
      id: encashment.id,
      requestNumber: encashment.requestNumber,
      employeeMasterId: encashment.employeeMasterId,
      employeeName: encashment.employeeMaster
        ? `${encashment.employeeMaster.firstName} ${encashment.employeeMaster.lastName}`
        : null,
      employeeCode: encashment.employeeMaster?.employeeCode || null,
      department: encashment.employeeMaster?.departmentId || null,
      leavePolicyId: encashment.leavePolicyId,
      leaveType: encashment.leavePolicy?.leaveType || null,
      daysToEncash: encashment.daysToEncash,
      encashmentAmount: Number(encashment.encashmentAmount),
      requestDate: encashment.requestDate.toISOString().split('T')[0],
      status: encashment.status,
      approvedBy: encashment.approvedBy || null,
      approvedDate: encashment.approvedDate ? encashment.approvedDate.toISOString().split('T')[0] : null,
      processedDate: encashment.processedDate ? encashment.processedDate.toISOString().split('T')[0] : null,
      rejectionReason: encashment.rejectionReason || null,
      createdAt: encashment.createdAt,
      updatedAt: encashment.updatedAt,
    }
  }
}

