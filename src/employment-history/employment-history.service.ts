import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateEmploymentHistoryDto } from './dto/create-employment-history.dto'
import { UpdateEmploymentHistoryDto } from './dto/update-employment-history.dto'

@Injectable()
export class EmploymentHistoryService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateEmploymentHistoryDto) {
    const employee = await this.prisma.employeeMaster.findUnique({
      where: { id: createDto.employeeMasterId },
    })
    if (!employee) {
      throw new NotFoundException('Employee not found')
    }

    const record = await this.prisma.employmentHistory.create({
      data: {
        employeeMasterId: createDto.employeeMasterId,
        eventType: createDto.eventType,
        eventDate: new Date(createDto.eventDate),
        effectiveDate: new Date(createDto.effectiveDate),
        previousValue: createDto.previousValue,
        newValue: createDto.newValue,
        previousDepartment: createDto.previousDepartment,
        newDepartment: createDto.newDepartment,
        previousDesignation: createDto.previousDesignation,
        newDesignation: createDto.newDesignation,
        previousSalary: createDto.previousSalary,
        newSalary: createDto.newSalary,
        previousStatus: createDto.previousStatus,
        newStatus: createDto.newStatus,
        reason: createDto.reason,
        description: createDto.description,
        approvedBy: createDto.approvedBy,
        remarks: createDto.remarks,
      },
      include: {
        employeeMaster: true,
      },
    })

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

    return this.formatResponse(record, departmentName, designationName)
  }

  async findAll(employeeMasterId?: string, eventType?: string, search?: string) {
    const where: any = {}
    if (employeeMasterId) where.employeeMasterId = employeeMasterId
    if (eventType) where.eventType = eventType
    if (search) {
      where.OR = [
        { employeeMaster: { firstName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { lastName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { employeeCode: { contains: search, mode: 'insensitive' } } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const records = await this.prisma.employmentHistory.findMany({
      where,
      include: {
        employeeMaster: true,
      },
      orderBy: { eventDate: 'desc' },
    })

    // Fetch department and designation for each record
    const formattedRecords = await Promise.all(
      records.map(async (r) => {
        let departmentName = ''
        let designationName = ''

        if (r.employeeMaster.departmentId) {
          const department = await this.prisma.department.findUnique({
            where: { id: r.employeeMaster.departmentId },
          })
          departmentName = department?.departmentName || ''
        }

        if (r.employeeMaster.designationId) {
          const designation = await this.prisma.designation.findUnique({
            where: { id: r.employeeMaster.designationId },
          })
          designationName = designation?.designationName || ''
        }

        return this.formatResponse(r, departmentName, designationName)
      })
    )

    return formattedRecords
  }

  async findOne(id: string) {
    const record = await this.prisma.employmentHistory.findUnique({
      where: { id },
      include: {
        employeeMaster: true,
      },
    })

    if (!record) {
      throw new NotFoundException('History record not found')
    }

    // Get department and designation names
    let departmentName = ''
    let designationName = ''

    if (record.employeeMaster.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: record.employeeMaster.departmentId },
      })
      departmentName = department?.departmentName || ''
    }

    if (record.employeeMaster.designationId) {
      const designation = await this.prisma.designation.findUnique({
        where: { id: record.employeeMaster.designationId },
      })
      designationName = designation?.designationName || ''
    }

    return this.formatResponse(record, departmentName, designationName)
  }

  async update(id: string, updateDto: UpdateEmploymentHistoryDto) {
    const record = await this.prisma.employmentHistory.findUnique({ where: { id } })
    if (!record) {
      throw new NotFoundException('History record not found')
    }

    const updated = await this.prisma.employmentHistory.update({
      where: { id },
      data: {
        eventType: updateDto.eventType,
        eventDate: updateDto.eventDate ? new Date(updateDto.eventDate) : undefined,
        effectiveDate: updateDto.effectiveDate ? new Date(updateDto.effectiveDate) : undefined,
        previousValue: updateDto.previousValue,
        newValue: updateDto.newValue,
        previousDepartment: updateDto.previousDepartment,
        newDepartment: updateDto.newDepartment,
        previousDesignation: updateDto.previousDesignation,
        newDesignation: updateDto.newDesignation,
        previousSalary: updateDto.previousSalary,
        newSalary: updateDto.newSalary,
        previousStatus: updateDto.previousStatus,
        newStatus: updateDto.newStatus,
        reason: updateDto.reason,
        description: updateDto.description,
        approvedBy: updateDto.approvedBy,
        remarks: updateDto.remarks,
      },
      include: {
        employeeMaster: true,
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
    const record = await this.prisma.employmentHistory.findUnique({ where: { id } })
    if (!record) {
      throw new NotFoundException('History record not found')
    }

    await this.prisma.employmentHistory.delete({ where: { id } })
  }

  private formatResponse(record: any, departmentName: string = '', designationName: string = '') {
    return {
      id: record.id,
      employeeId: record.employeeMasterId,
      employeeCode: record.employeeMaster.employeeCode,
      employeeName: `${record.employeeMaster.firstName} ${record.employeeMaster.lastName}`,
      departmentName,
      designationName,
      eventType: record.eventType,
      eventDate: record.eventDate.toISOString().split('T')[0],
      effectiveDate: record.effectiveDate.toISOString().split('T')[0],
      previousValue: record.previousValue,
      newValue: record.newValue,
      previousDepartment: record.previousDepartment,
      newDepartment: record.newDepartment,
      previousDesignation: record.previousDesignation,
      newDesignation: record.newDesignation,
      previousSalary: record.previousSalary,
      newSalary: record.newSalary,
      previousStatus: record.previousStatus,
      newStatus: record.newStatus,
      reason: record.reason,
      description: record.description,
      approvedBy: record.approvedBy,
      remarks: record.remarks,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }
  }
}

