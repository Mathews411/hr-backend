import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateShiftDto } from './dto/create-shift.dto'
import { UpdateShiftDto } from './dto/update-shift.dto'

@Injectable()
export class ShiftsService {
  constructor(private prisma: PrismaService) {}

  async create(createShiftDto: CreateShiftDto) {
    // Check if shift code already exists
    const existing = await this.prisma.shift.findUnique({
      where: { shiftCode: createShiftDto.shiftCode },
    })

    if (existing) {
      throw new Error('Shift code already exists')
    }

    // Validate locationId if provided
    if (createShiftDto.locationId) {
      const location = await this.prisma.location.findUnique({
        where: { id: createShiftDto.locationId },
      })
      if (!location) {
        throw new Error('Location not found')
      }
    }

    // Validate departmentIds if provided
    if (createShiftDto.departmentIds && createShiftDto.departmentIds.length > 0) {
      for (const deptId of createShiftDto.departmentIds) {
        const department = await this.prisma.department.findUnique({
          where: { id: deptId },
        })
        if (!department) {
          throw new Error(`Department with id ${deptId} not found`)
        }
      }
    }

    // Validate designationIds if provided
    if (createShiftDto.designationIds && createShiftDto.designationIds.length > 0) {
      for (const desId of createShiftDto.designationIds) {
        const designation = await this.prisma.designation.findUnique({
          where: { id: desId },
        })
        if (!designation) {
          throw new Error(`Designation with id ${desId} not found`)
        }
      }
    }

    // Calculate total hours if not provided
    let totalHours = createShiftDto.totalHours
    if (!totalHours) {
      totalHours = this.calculateTotalHours(
        createShiftDto.startTime,
        createShiftDto.endTime,
        createShiftDto.breakDuration || 0
      )
    }

    return this.prisma.shift.create({
      data: {
        shiftName: createShiftDto.shiftName,
        shiftCode: createShiftDto.shiftCode,
        startTime: createShiftDto.startTime,
        endTime: createShiftDto.endTime,
        breakDuration: createShiftDto.breakDuration ?? 0,
        totalHours,
        isFlexible: createShiftDto.isFlexible ?? false,
        employeeCount: createShiftDto.employeeCount ?? 0,
        isActive: createShiftDto.isActive ?? true,
        workingDays: createShiftDto.workingDays,
        locationId: createShiftDto.locationId || null,
        departmentIds: createShiftDto.departmentIds || [],
        designationIds: createShiftDto.designationIds || [],
      } as any,
    })
  }

  async findAll(isActive?: boolean) {
    const where = isActive !== undefined ? { isActive } : {}
    const shifts = await this.prisma.shift.findMany({
      where,
      include: {
        location: {
          select: {
            id: true,
            branchName: true,
            branchCode: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Fetch departments and designations for each shift
    const allDepartmentIds = new Set<string>()
    const allDesignationIds = new Set<string>()
    
    shifts.forEach(shift => {
      shift.departmentIds.forEach(id => allDepartmentIds.add(id))
      shift.designationIds.forEach(id => allDesignationIds.add(id))
    })

    const departments = await this.prisma.department.findMany({
      where: { id: { in: Array.from(allDepartmentIds) } },
      select: {
        id: true,
        departmentName: true,
        departmentCode: true,
        locationId: true,
      },
    })

    const designations = await this.prisma.designation.findMany({
      where: { id: { in: Array.from(allDesignationIds) } },
      select: {
        id: true,
        designationName: true,
        designationCode: true,
        department: true,
      },
    })

    const departmentMap = new Map(departments.map(d => [d.id, d]))
    const designationMap = new Map(designations.map(d => [d.id, d]))

    // Attach department and designation data to shifts
    return shifts.map(shift => ({
      ...shift,
      departments: shift.departmentIds.map(id => departmentMap.get(id)).filter(Boolean),
      designations: shift.designationIds.map(id => designationMap.get(id)).filter(Boolean),
    }))
  }

  async findOne(id: string) {
    const shift = await this.prisma.shift.findUnique({
      where: { id },
    })

    if (!shift) {
      throw new NotFoundException('Shift not found')
    }

    return shift
  }

  async update(id: string, updateShiftDto: UpdateShiftDto) {
    const shift = await this.prisma.shift.findUnique({
      where: { id },
    })

    if (!shift) {
      throw new NotFoundException('Shift not found')
    }

    // Check if shift code is being updated and if it conflicts
    if (updateShiftDto.shiftCode && updateShiftDto.shiftCode !== shift.shiftCode) {
      const existing = await this.prisma.shift.findUnique({
        where: { shiftCode: updateShiftDto.shiftCode },
      })

      if (existing) {
        throw new Error('Shift code already exists')
      }
    }

    // Validate locationId if provided
    if (updateShiftDto.locationId) {
      const location = await this.prisma.location.findUnique({
        where: { id: updateShiftDto.locationId },
      })
      if (!location) {
        throw new Error('Location not found')
      }
    }

    // Validate departmentIds if provided
    if (updateShiftDto.departmentIds && updateShiftDto.departmentIds.length > 0) {
      for (const deptId of updateShiftDto.departmentIds) {
        const department = await this.prisma.department.findUnique({
          where: { id: deptId },
        })
        if (!department) {
          throw new Error(`Department with id ${deptId} not found`)
        }
      }
    }

    // Validate designationIds if provided
    if (updateShiftDto.designationIds && updateShiftDto.designationIds.length > 0) {
      for (const desId of updateShiftDto.designationIds) {
        const designation = await this.prisma.designation.findUnique({
          where: { id: desId },
        })
        if (!designation) {
          throw new Error(`Designation with id ${desId} not found`)
        }
      }
    }

    // Recalculate total hours if time or break duration changed
    let totalHours = updateShiftDto.totalHours
    if (
      updateShiftDto.startTime ||
      updateShiftDto.endTime ||
      updateShiftDto.breakDuration !== undefined
    ) {
      const startTime = updateShiftDto.startTime || shift.startTime
      const endTime = updateShiftDto.endTime || shift.endTime
      const breakDuration = updateShiftDto.breakDuration ?? shift.breakDuration
      totalHours = this.calculateTotalHours(startTime, endTime, breakDuration)
    }

    const updateData: any = {
      ...(updateShiftDto.shiftName !== undefined && { shiftName: updateShiftDto.shiftName }),
      ...(updateShiftDto.shiftCode !== undefined && { shiftCode: updateShiftDto.shiftCode }),
      ...(updateShiftDto.startTime !== undefined && { startTime: updateShiftDto.startTime }),
      ...(updateShiftDto.endTime !== undefined && { endTime: updateShiftDto.endTime }),
      ...(updateShiftDto.breakDuration !== undefined && { breakDuration: updateShiftDto.breakDuration }),
      ...(updateShiftDto.isFlexible !== undefined && { isFlexible: updateShiftDto.isFlexible }),
      ...(updateShiftDto.employeeCount !== undefined && { employeeCount: updateShiftDto.employeeCount }),
      ...(updateShiftDto.isActive !== undefined && { isActive: updateShiftDto.isActive }),
      ...(updateShiftDto.workingDays !== undefined && { workingDays: updateShiftDto.workingDays }),
      ...(updateShiftDto.locationId !== undefined && { locationId: updateShiftDto.locationId || null }),
      ...(updateShiftDto.departmentIds !== undefined && { departmentIds: updateShiftDto.departmentIds || [] }),
      ...(updateShiftDto.designationIds !== undefined && { designationIds: updateShiftDto.designationIds || [] }),
      ...(totalHours !== undefined && { totalHours }),
    }

    return this.prisma.shift.update({
      where: { id },
      data: updateData,
    })
  }

  async remove(id: string) {
    const shift = await this.prisma.shift.findUnique({
      where: { id },
    })

    if (!shift) {
      throw new NotFoundException('Shift not found')
    }

    return this.prisma.shift.delete({
      where: { id },
    })
  }

  async toggleActive(id: string) {
    const shift = await this.prisma.shift.findUnique({
      where: { id },
    })

    if (!shift) {
      throw new NotFoundException('Shift not found')
    }

    return this.prisma.shift.update({
      where: { id },
      data: { isActive: !shift.isActive },
    })
  }

  private calculateTotalHours(startTime: string, endTime: string, breakDuration: number): number {
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)

    let startMinutes = startHour * 60 + startMin
    let endMinutes = endHour * 60 + endMin

    // Handle overnight shifts
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60
    }

    const totalMinutes = endMinutes - startMinutes - breakDuration
    return parseFloat((totalMinutes / 60).toFixed(1))
  }
}

