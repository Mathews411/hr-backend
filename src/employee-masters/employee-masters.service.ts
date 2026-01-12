import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateEmployeeMasterDto } from './dto/create-employee-master.dto'
import { UpdateEmployeeMasterDto } from './dto/update-employee-master.dto'
import { EmployeeMasterStatus } from '@prisma/client'

@Injectable()
export class EmployeeMastersService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeMasterDto: CreateEmployeeMasterDto) {
    // Check if email already exists
    const existingEmail = await this.prisma.employeeMaster.findUnique({
      where: { email: createEmployeeMasterDto.email },
    })

    if (existingEmail) {
      throw new ConflictException('Employee with this email already exists')
    }

    // Generate employee code if not provided
    let employeeCode = createEmployeeMasterDto.employeeCode
    if (!employeeCode) {
      const count = await this.prisma.employeeMaster.count()
      employeeCode = `EMP-${String(count + 1).padStart(3, '0')}`
    } else {
      // Check if employee code already exists
      const existingCode = await this.prisma.employeeMaster.findUnique({
        where: { employeeCode },
      })
      if (existingCode) {
        throw new ConflictException('Employee code already exists')
      }
    }

    // Validate user if userId provided
    if (createEmployeeMasterDto.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: createEmployeeMasterDto.userId },
      })
      if (!user) {
        throw new NotFoundException('User not found')
      }
    }

    // Handle reportingManager: if manager name is provided, look it up and convert to reportingManagerId
    let reportingManagerId = createEmployeeMasterDto.reportingManagerId
    if (createEmployeeMasterDto.reportingManager && !reportingManagerId) {
      // Try to find by employee code or full name
      const manager = await this.prisma.employeeMaster.findFirst({
        where: {
          OR: [
            { employeeCode: createEmployeeMasterDto.reportingManager },
            { 
              OR: [
                { firstName: { contains: createEmployeeMasterDto.reportingManager, mode: 'insensitive' } },
                { lastName: { contains: createEmployeeMasterDto.reportingManager, mode: 'insensitive' } },
                {
                  AND: [
                    { firstName: { contains: createEmployeeMasterDto.reportingManager.split(' ')[0] || '', mode: 'insensitive' } },
                    { lastName: { contains: createEmployeeMasterDto.reportingManager.split(' ')[1] || '', mode: 'insensitive' } },
                  ]
                }
              ]
            }
          ]
        },
      })

      if (manager) {
        reportingManagerId = manager.id
      } else {
        throw new NotFoundException(`Reporting manager "${createEmployeeMasterDto.reportingManager}" not found`)
      }
    }

    // Handle workLocation: if location name is provided, look it up and convert to workLocationId
    let workLocationId = createEmployeeMasterDto.workLocationId
    if (createEmployeeMasterDto.workLocation && !workLocationId) {
      const location = await this.prisma.location.findFirst({
        where: {
          OR: [
            { branchName: { equals: createEmployeeMasterDto.workLocation, mode: 'insensitive' } },
            { branchCode: { equals: createEmployeeMasterDto.workLocation, mode: 'insensitive' } },
            { city: { equals: createEmployeeMasterDto.workLocation, mode: 'insensitive' } },
          ],
          isActive: true,
        },
      })

      if (location) {
        workLocationId = location.id
      } else {
        throw new NotFoundException(`Work location "${createEmployeeMasterDto.workLocation}" not found`)
      }
    }

    const employee = await this.prisma.employeeMaster.create({
      data: {
        employeeCode,
        firstName: createEmployeeMasterDto.firstName,
        lastName: createEmployeeMasterDto.lastName,
        email: createEmployeeMasterDto.email,
        phone: createEmployeeMasterDto.phone,
        alternatePhone: createEmployeeMasterDto.alternatePhone,
        dateOfBirth: createEmployeeMasterDto.dateOfBirth ? new Date(createEmployeeMasterDto.dateOfBirth) : null,
        gender: createEmployeeMasterDto.gender,
        maritalStatus: createEmployeeMasterDto.maritalStatus,
        bloodGroup: createEmployeeMasterDto.bloodGroup,
        departmentId: createEmployeeMasterDto.departmentId,
        designationId: createEmployeeMasterDto.designationId,
        employeeType: createEmployeeMasterDto.employeeType,
        joiningDate: createEmployeeMasterDto.joiningDate ? new Date(createEmployeeMasterDto.joiningDate) : null,
        confirmationDate: createEmployeeMasterDto.confirmationDate ? new Date(createEmployeeMasterDto.confirmationDate) : null,
        reportingManagerId,
        workLocationId,
        shiftId: createEmployeeMasterDto.shiftId,
        salaryTemplateId: createEmployeeMasterDto.salaryTemplateId,
        panNumber: createEmployeeMasterDto.panNumber,
        aadharNumber: createEmployeeMasterDto.aadharNumber,
        uanNumber: createEmployeeMasterDto.uanNumber,
        esicNumber: createEmployeeMasterDto.esicNumber,
        address: createEmployeeMasterDto.address,
        city: createEmployeeMasterDto.city,
        state: createEmployeeMasterDto.state,
        zipCode: createEmployeeMasterDto.zipCode,
        country: createEmployeeMasterDto.country,
        emergencyContactName: createEmployeeMasterDto.emergencyContactName,
        emergencyContactRelation: createEmployeeMasterDto.emergencyContactRelation,
        emergencyContactPhone: createEmployeeMasterDto.emergencyContactPhone,
        status: createEmployeeMasterDto.status || EmployeeMasterStatus.ACTIVE,
        profilePhoto: createEmployeeMasterDto.profilePhoto,
        userId: createEmployeeMasterDto.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        department: {
          select: {
            id: true,
            departmentName: true,
          },
        },
        designation: {
          select: {
            id: true,
            designationName: true,
          },
        },
        workLocation: {
          select: {
            id: true,
            branchName: true,
            branchCode: true,
          },
        },
        shift: {
          select: {
            id: true,
            shiftName: true,
            shiftCode: true,
          },
        },
        reportingManager: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return await this.formatEmployeeResponse(employee)
  }

  async findAll(departmentId?: string, status?: string, search?: string) {
    const where: any = {}
    if (departmentId) where.departmentId = departmentId
    if (status) {
      // Convert string status to enum value
      const statusMap: Record<string, EmployeeMasterStatus> = {
        'Active': EmployeeMasterStatus.ACTIVE,
        'Inactive': EmployeeMasterStatus.INACTIVE,
        'On Leave': EmployeeMasterStatus.ON_LEAVE,
        'On_Leave': EmployeeMasterStatus.ON_LEAVE,
        'Terminated': EmployeeMasterStatus.TERMINATED,
        'ACTIVE': EmployeeMasterStatus.ACTIVE,
        'INACTIVE': EmployeeMasterStatus.INACTIVE,
        'ON_LEAVE': EmployeeMasterStatus.ON_LEAVE,
        'TERMINATED': EmployeeMasterStatus.TERMINATED,
      }
      const enumStatus = statusMap[status]
      if (enumStatus) {
        where.status = enumStatus
      }
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeCode: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }

    const employees = await this.prisma.employeeMaster.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        department: {
          select: {
            id: true,
            departmentName: true,
          },
        },
        designation: {
          select: {
            id: true,
            designationName: true,
          },
        },
        workLocation: {
          select: {
            id: true,
            branchName: true,
            branchCode: true,
          },
        },
        shift: {
          select: {
            id: true,
            shiftName: true,
            shiftCode: true,
          },
        },
        reportingManager: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return Promise.all(employees.map(emp => this.formatEmployeeResponse(emp)))
  }

  async findOne(id: string) {
    const employee = await this.prisma.employeeMaster.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        department: {
          select: {
            id: true,
            departmentName: true,
          },
        },
        designation: {
          select: {
            id: true,
            designationName: true,
          },
        },
        workLocation: {
          select: {
            id: true,
            branchName: true,
            branchCode: true,
          },
        },
        shift: {
          select: {
            id: true,
            shiftName: true,
            shiftCode: true,
          },
        },
        reportingManager: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!employee) {
      throw new NotFoundException('Employee not found')
    }

    return await this.formatEmployeeResponse(employee)
  }

  async update(id: string, updateEmployeeMasterDto: UpdateEmployeeMasterDto) {
    const employee = await this.prisma.employeeMaster.findUnique({
      where: { id },
    })

    if (!employee) {
      throw new NotFoundException('Employee not found')
    }

    // Check email uniqueness if email is being updated
    if (updateEmployeeMasterDto.email && updateEmployeeMasterDto.email !== employee.email) {
      const existingEmail = await this.prisma.employeeMaster.findUnique({
        where: { email: updateEmployeeMasterDto.email },
      })
      if (existingEmail) {
        throw new ConflictException('Employee with this email already exists')
      }
    }

    // Handle reportingManager: if manager name is provided, look it up and convert to reportingManagerId
    let reportingManagerId = updateEmployeeMasterDto.reportingManagerId
    if (updateEmployeeMasterDto.reportingManager !== undefined && !reportingManagerId) {
      if (updateEmployeeMasterDto.reportingManager === null) {
        reportingManagerId = null
      } else {
        // Try to find by employee code or full name
        const manager = await this.prisma.employeeMaster.findFirst({
          where: {
            OR: [
              { employeeCode: updateEmployeeMasterDto.reportingManager },
              { 
                OR: [
                  { firstName: { contains: updateEmployeeMasterDto.reportingManager, mode: 'insensitive' } },
                  { lastName: { contains: updateEmployeeMasterDto.reportingManager, mode: 'insensitive' } },
                  {
                    AND: [
                      { firstName: { contains: (updateEmployeeMasterDto.reportingManager.split(' ')[0] || ''), mode: 'insensitive' } },
                      { lastName: { contains: (updateEmployeeMasterDto.reportingManager.split(' ')[1] || ''), mode: 'insensitive' } },
                    ]
                  }
                ]
              }
            ]
          },
        })

        if (manager) {
          reportingManagerId = manager.id
        } else {
          throw new NotFoundException(`Reporting manager "${updateEmployeeMasterDto.reportingManager}" not found`)
        }
      }
    }

    // Handle workLocation: if location name is provided, look it up and convert to workLocationId
    let workLocationId = updateEmployeeMasterDto.workLocationId
    if (updateEmployeeMasterDto.workLocation !== undefined && !workLocationId) {
      if (updateEmployeeMasterDto.workLocation === null) {
        workLocationId = null
      } else {
        const location = await this.prisma.location.findFirst({
          where: {
            OR: [
              { branchName: { equals: updateEmployeeMasterDto.workLocation, mode: 'insensitive' } },
              { branchCode: { equals: updateEmployeeMasterDto.workLocation, mode: 'insensitive' } },
              { city: { equals: updateEmployeeMasterDto.workLocation, mode: 'insensitive' } },
            ],
            isActive: true,
          },
        })

        if (location) {
          workLocationId = location.id
        } else {
          throw new NotFoundException(`Work location "${updateEmployeeMasterDto.workLocation}" not found`)
        }
      }
    }

    const updateData: any = { ...updateEmployeeMasterDto }
    // Remove the string fields that we've converted to IDs
    delete updateData.reportingManager
    delete updateData.workLocation
    
    // Set the converted IDs
    if (reportingManagerId !== undefined) {
      updateData.reportingManagerId = reportingManagerId
    }
    if (workLocationId !== undefined) {
      updateData.workLocationId = workLocationId
    }
    
    if (updateEmployeeMasterDto.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateEmployeeMasterDto.dateOfBirth)
    }
    if (updateEmployeeMasterDto.joiningDate) {
      updateData.joiningDate = new Date(updateEmployeeMasterDto.joiningDate)
    }
    if (updateEmployeeMasterDto.confirmationDate) {
      updateData.confirmationDate = new Date(updateEmployeeMasterDto.confirmationDate)
    }

    const updated = await this.prisma.employeeMaster.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        department: {
          select: {
            id: true,
            departmentName: true,
          },
        },
        designation: {
          select: {
            id: true,
            designationName: true,
          },
        },
        workLocation: {
          select: {
            id: true,
            branchName: true,
            branchCode: true,
          },
        },
        shift: {
          select: {
            id: true,
            shiftName: true,
            shiftCode: true,
          },
        },
        reportingManager: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return await this.formatEmployeeResponse(updated)
  }

  async remove(id: string) {
    const employee = await this.prisma.employeeMaster.findUnique({
      where: { id },
    })

    if (!employee) {
      throw new NotFoundException('Employee not found')
    }

    await this.prisma.employeeMaster.delete({
      where: { id },
    })
  }

  private async formatEmployeeResponse(emp: any) {
    return {
      id: emp.id,
      employeeCode: emp.employeeCode,
      firstName: emp.firstName,
      lastName: emp.lastName,
      fullName: `${emp.firstName} ${emp.lastName}`,
      email: emp.email,
      phone: emp.phone,
      alternatePhone: emp.alternatePhone,
      dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.toISOString().split('T')[0] : null,
      gender: emp.gender,
      maritalStatus: emp.maritalStatus,
      bloodGroup: emp.bloodGroup,
      departmentId: emp.departmentId,
      departmentName: emp.department?.departmentName || emp.departmentId,
      designationId: emp.designationId,
      designationName: emp.designation?.designationName || emp.designationId,
      employeeType: emp.employeeType,
      joiningDate: emp.joiningDate ? emp.joiningDate.toISOString().split('T')[0] : null,
      confirmationDate: emp.confirmationDate ? emp.confirmationDate.toISOString().split('T')[0] : null,
      reportingManagerId: emp.reportingManagerId,
      reportingManager: emp.reportingManager ? {
        id: emp.reportingManager.id,
        employeeCode: emp.reportingManager.employeeCode,
        fullName: `${emp.reportingManager.firstName} ${emp.reportingManager.lastName}`,
      } : null,
      workLocationId: emp.workLocationId,
      workLocation: emp.workLocation ? {
        id: emp.workLocation.id,
        branchName: emp.workLocation.branchName,
        branchCode: emp.workLocation.branchCode,
      } : null,
      shiftId: emp.shiftId,
      shift: emp.shift ? {
        id: emp.shift.id,
        shiftName: emp.shift.shiftName,
        shiftCode: emp.shift.shiftCode,
      } : null,
      salaryTemplateId: emp.salaryTemplateId,
      panNumber: emp.panNumber,
      aadharNumber: emp.aadharNumber,
      uanNumber: emp.uanNumber,
      esicNumber: emp.esicNumber,
      address: emp.address,
      city: emp.city,
      state: emp.state,
      zipCode: emp.zipCode,
      country: emp.country,
      emergencyContactName: emp.emergencyContactName,
      emergencyContactRelation: emp.emergencyContactRelation,
      emergencyContactPhone: emp.emergencyContactPhone,
      status: emp.status === EmployeeMasterStatus.ACTIVE ? 'Active' :
              emp.status === EmployeeMasterStatus.INACTIVE ? 'Inactive' :
              emp.status === EmployeeMasterStatus.ON_LEAVE ? 'On Leave' : 'Terminated',
      profilePhoto: emp.profilePhoto,
      createdDate: emp.createdAt.toISOString().split('T')[0],
      updatedDate: emp.updatedAt ? emp.updatedAt.toISOString().split('T')[0] : null,
      createdAt: emp.createdAt,
      updatedAt: emp.updatedAt,
    }
  }
}
