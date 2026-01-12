import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateLeaveBalanceDto } from './dto/create-leave-balance.dto'
import { UpdateLeaveBalanceDto } from './dto/update-leave-balance.dto'

@Injectable()
export class LeaveBalancesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateLeaveBalanceDto) {
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

    // Check if balance already exists for this employee, policy, and year
    const existing = await this.prisma.leaveBalance.findUnique({
      where: {
        employeeMasterId_leavePolicyId_year: {
          employeeMasterId: createDto.employeeMasterId,
          leavePolicyId: createDto.leavePolicyId,
          year: createDto.year,
        },
      },
    })

    if (existing) {
      throw new ConflictException('Leave balance already exists for this employee, policy, and year')
    }

    // Calculate available balance
    const used = createDto.used || 0
    const carryForward = createDto.carryForward || 0
    const available = createDto.totalAllocated + carryForward - used

    if (available < 0) {
      throw new BadRequestException('Available balance cannot be negative')
    }

    const balance = await this.prisma.leaveBalance.create({
      data: {
        employeeMasterId: createDto.employeeMasterId,
        leavePolicyId: createDto.leavePolicyId,
        year: createDto.year,
        totalAllocated: createDto.totalAllocated,
        used,
        available,
        carryForward,
      },
      include: {
        employeeMaster: true,
        leavePolicy: true,
      },
    })

    return this.formatResponse(balance)
  }

  async findAll(employeeId?: string, year?: number, departmentId?: string, search?: string) {
    const where: any = {}

    if (employeeId) {
      where.employeeMasterId = employeeId
    }

    if (year) {
      where.year = year
    }

    if (departmentId) {
      where.employeeMaster = {
        departmentId,
      }
    }

    if (search) {
      where.OR = [
        { employeeMaster: { firstName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { lastName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { employeeCode: { contains: search, mode: 'insensitive' } } },
        { leavePolicy: { leaveType: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const balances = await this.prisma.leaveBalance.findMany({
      where,
      include: {
        employeeMaster: true,
        leavePolicy: true,
      },
      orderBy: [
        { year: 'desc' },
        { employeeMaster: { employeeCode: 'asc' } },
      ],
    })

    return balances.map((balance) => this.formatResponse(balance))
  }

  async findOne(id: string) {
    const balance = await this.prisma.leaveBalance.findUnique({
      where: { id },
      include: {
        employeeMaster: true,
        leavePolicy: true,
      },
    })

    if (!balance) {
      throw new NotFoundException('Leave balance not found')
    }

    return this.formatResponse(balance)
  }

  async findByEmployee(employeeId: string, year?: number) {
    const where: any = {
      employeeMasterId: employeeId,
    }

    if (year) {
      where.year = year
    }

    const balances = await this.prisma.leaveBalance.findMany({
      where,
      include: {
        employeeMaster: true,
        leavePolicy: true,
      },
      orderBy: {
        leavePolicy: { leaveType: 'asc' },
      },
    })

    if (balances.length === 0) {
      return {
        employeeId,
        employeeName: null,
        employeeCode: null,
        department: null,
        balances: [],
        totalAvailable: 0,
        totalUsed: 0,
        totalAllocated: 0,
      }
    }

    const employee = balances[0].employeeMaster
    const totalAvailable = balances.reduce((sum, b) => sum + b.available, 0)
    const totalUsed = balances.reduce((sum, b) => sum + b.used, 0)
    const totalAllocated = balances.reduce((sum, b) => sum + b.totalAllocated, 0)

    return {
      employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      employeeCode: employee.employeeCode,
      department: employee.departmentId,
      balances: balances.map((b) => this.formatResponse(b)),
      totalAvailable,
      totalUsed,
      totalAllocated,
    }
  }

  async update(id: string, updateDto: UpdateLeaveBalanceDto) {
    const balance = await this.prisma.leaveBalance.findUnique({
      where: { id },
    })

    if (!balance) {
      throw new NotFoundException('Leave balance not found')
    }

    const updateData: any = {}

    if (updateDto.employeeMasterId) {
      const employee = await this.prisma.employeeMaster.findUnique({
        where: { id: updateDto.employeeMasterId },
      })
      if (!employee) {
        throw new NotFoundException('Employee not found')
      }
      updateData.employeeMasterId = updateDto.employeeMasterId
    }

    if (updateDto.leavePolicyId) {
      const leavePolicy = await this.prisma.leavePolicy.findUnique({
        where: { id: updateDto.leavePolicyId },
      })
      if (!leavePolicy) {
        throw new NotFoundException('Leave policy not found')
      }
      updateData.leavePolicyId = updateDto.leavePolicyId
    }

    if (updateDto.year !== undefined) {
      updateData.year = updateDto.year
    }

    if (updateDto.totalAllocated !== undefined) {
      updateData.totalAllocated = updateDto.totalAllocated
    }

    if (updateDto.used !== undefined) {
      updateData.used = updateDto.used
    }

    if (updateDto.carryForward !== undefined) {
      updateData.carryForward = updateDto.carryForward
    }

    // Recalculate available balance
    const totalAllocated = updateDto.totalAllocated !== undefined ? updateDto.totalAllocated : balance.totalAllocated
    const used = updateDto.used !== undefined ? updateDto.used : balance.used
    const carryForward = updateDto.carryForward !== undefined ? updateDto.carryForward : balance.carryForward
    const available = totalAllocated + carryForward - used

    if (available < 0) {
      throw new BadRequestException('Available balance cannot be negative')
    }

    updateData.available = available

    const updated = await this.prisma.leaveBalance.update({
      where: { id },
      data: updateData,
      include: {
        employeeMaster: true,
        leavePolicy: true,
      },
    })

    return this.formatResponse(updated)
  }

  async remove(id: string) {
    const balance = await this.prisma.leaveBalance.findUnique({
      where: { id },
    })

    if (!balance) {
      throw new NotFoundException('Leave balance not found')
    }

    await this.prisma.leaveBalance.delete({
      where: { id },
    })
  }

  private formatResponse(balance: any) {
    return {
      id: balance.id,
      employeeMasterId: balance.employeeMasterId,
      employeeName: balance.employeeMaster
        ? `${balance.employeeMaster.firstName} ${balance.employeeMaster.lastName}`
        : null,
      employeeCode: balance.employeeMaster?.employeeCode || null,
      department: balance.employeeMaster?.departmentId || null,
      leavePolicyId: balance.leavePolicyId,
      leaveType: balance.leavePolicy?.leaveType || null,
      totalAllocated: balance.totalAllocated,
      used: balance.used,
      available: balance.available,
      carryForward: balance.carryForward,
      year: balance.year,
    }
  }
}

