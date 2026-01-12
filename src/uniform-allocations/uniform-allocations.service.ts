import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateUniformAllocationDto } from './dto/create-uniform-allocation.dto'
import { UpdateUniformAllocationDto } from './dto/update-uniform-allocation.dto'

@Injectable()
export class UniformAllocationsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateUniformAllocationDto) {
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

    const uniformItem = await this.prisma.uniformItem.findUnique({
      where: { id: createDto.uniformItemId },
    })
    if (!uniformItem) {
      throw new NotFoundException('Uniform item not found')
    }

    if (uniformItem.availableQuantity < createDto.quantity) {
      throw new NotFoundException('Insufficient uniform items available')
    }

    const allocation = await this.prisma.uniformAllocation.create({
      data: {
        employeeMasterId: createDto.employeeMasterId,
        uniformItemId: createDto.uniformItemId,
        size: createDto.size,
        quantity: createDto.quantity,
        issueDate: createDto.issueDate ? new Date(createDto.issueDate) : new Date(),
        expectedReturnDate: createDto.expectedReturnDate ? new Date(createDto.expectedReturnDate) : null,
        condition: createDto.condition || 'Good',
        remarks: createDto.remarks,
        issuedBy: createDto.issuedBy,
      },
      include: {
        employeeMaster: true,
        uniformItem: true,
      },
    })

    // Update uniform item quantities
    await this.prisma.uniformItem.update({
      where: { id: createDto.uniformItemId },
      data: {
        allocatedQuantity: { increment: createDto.quantity },
        availableQuantity: { decrement: createDto.quantity },
      },
    })

    return this.formatResponse(allocation, departmentName, designationName)
  }

  async findAll(employeeMasterId?: string, status?: string, category?: string, search?: string) {
    const where: any = {}
    if (employeeMasterId) where.employeeMasterId = employeeMasterId
    if (status) where.status = status
    if (category) where.uniformItem = { category }
    if (search) {
      where.OR = [
        { employeeMaster: { firstName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { lastName: { contains: search, mode: 'insensitive' } } },
        { employeeMaster: { employeeCode: { contains: search, mode: 'insensitive' } } },
        { uniformItem: { itemName: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const allocations = await this.prisma.uniformAllocation.findMany({
      where,
      include: {
        employeeMaster: true,
        uniformItem: true,
      },
      orderBy: { issueDate: 'desc' },
    })

    // Fetch department and designation for each allocation
    const formattedAllocations = await Promise.all(
      allocations.map(async (a) => {
        let departmentName = ''
        let designationName = ''

        if (a.employeeMaster.departmentId) {
          const department = await this.prisma.department.findUnique({
            where: { id: a.employeeMaster.departmentId },
          })
          departmentName = department?.departmentName || ''
        }

        if (a.employeeMaster.designationId) {
          const designation = await this.prisma.designation.findUnique({
            where: { id: a.employeeMaster.designationId },
          })
          designationName = designation?.designationName || ''
        }

        return this.formatResponse(a, departmentName, designationName)
      })
    )

    return formattedAllocations
  }

  async findOne(id: string) {
    const allocation = await this.prisma.uniformAllocation.findUnique({
      where: { id },
      include: {
        employeeMaster: true,
        uniformItem: true,
      },
    })

    if (!allocation) {
      throw new NotFoundException('Uniform allocation not found')
    }

    // Get department and designation names
    let departmentName = ''
    let designationName = ''

    if (allocation.employeeMaster.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: allocation.employeeMaster.departmentId },
      })
      departmentName = department?.departmentName || ''
    }

    if (allocation.employeeMaster.designationId) {
      const designation = await this.prisma.designation.findUnique({
        where: { id: allocation.employeeMaster.designationId },
      })
      designationName = designation?.designationName || ''
    }

    return this.formatResponse(allocation, departmentName, designationName)
  }

  async update(id: string, updateDto: UpdateUniformAllocationDto) {
    const allocation = await this.prisma.uniformAllocation.findUnique({ where: { id } })
    if (!allocation) {
      throw new NotFoundException('Uniform allocation not found')
    }

    const updated = await this.prisma.uniformAllocation.update({
      where: { id },
      data: {
        uniformItemId: updateDto.uniformItemId,
        size: updateDto.size,
        quantity: updateDto.quantity,
        expectedReturnDate: updateDto.expectedReturnDate ? new Date(updateDto.expectedReturnDate) : undefined,
        status: updateDto.status,
        condition: updateDto.condition,
        remarks: updateDto.remarks,
        returnDate: updateDto.returnDate ? new Date(updateDto.returnDate) : undefined,
        returnedBy: updateDto.returnedBy,
        returnedDate: updateDto.returnDate ? new Date(updateDto.returnDate) : undefined,
      },
      include: {
        employeeMaster: true,
        uniformItem: true,
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
    const allocation = await this.prisma.uniformAllocation.findUnique({ where: { id } })
    if (!allocation) {
      throw new NotFoundException('Uniform allocation not found')
    }

    // Return quantity to available
    await this.prisma.uniformItem.update({
      where: { id: allocation.uniformItemId },
      data: {
        allocatedQuantity: { decrement: allocation.quantity },
        availableQuantity: { increment: allocation.quantity },
      },
    })

    await this.prisma.uniformAllocation.delete({ where: { id } })
  }

  private formatResponse(allocation: any, departmentName: string = '', designationName: string = '') {
    return {
      id: allocation.id,
      employeeId: allocation.employeeMasterId,
      employeeCode: allocation.employeeMaster.employeeCode,
      employeeName: `${allocation.employeeMaster.firstName} ${allocation.employeeMaster.lastName}`,
      departmentName,
      designationName,
      uniformItemId: allocation.uniformItemId,
      uniformItemName: allocation.uniformItem.itemName,
      uniformItemCode: allocation.uniformItem.itemCode,
      category: allocation.uniformItem.category,
      size: allocation.size,
      quantity: allocation.quantity,
      issueDate: allocation.issueDate.toISOString().split('T')[0],
      returnDate: allocation.returnDate ? allocation.returnDate.toISOString().split('T')[0] : null,
      expectedReturnDate: allocation.expectedReturnDate ? allocation.expectedReturnDate.toISOString().split('T')[0] : null,
      status: allocation.status === 'ISSUED' ? 'Issued' :
              allocation.status === 'RETURNED' ? 'Returned' :
              allocation.status === 'LOST' ? 'Lost' :
              allocation.status === 'DAMAGED' ? 'Damaged' : 'Expired',
      condition: allocation.condition,
      remarks: allocation.remarks,
      issuedBy: allocation.issuedBy,
      returnedBy: allocation.returnedBy,
      returnedDate: allocation.returnedDate ? allocation.returnedDate.toISOString().split('T')[0] : null,
      createdAt: allocation.createdAt,
      updatedAt: allocation.updatedAt,
    }
  }
}

