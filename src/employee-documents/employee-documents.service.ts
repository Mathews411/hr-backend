import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateEmployeeDocumentDto } from './dto/create-employee-document.dto'
import { UpdateEmployeeDocumentDto } from './dto/update-employee-document.dto'

@Injectable()
export class EmployeeDocumentsService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeDocumentDto: CreateEmployeeDocumentDto) {
    // Verify employee exists
    const employee = await this.prisma.employeeMaster.findUnique({
      where: { id: createEmployeeDocumentDto.employeeMasterId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
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

    const uploadDate = createEmployeeDocumentDto.uploadDate
      ? new Date(createEmployeeDocumentDto.uploadDate)
      : new Date()

    const document = await this.prisma.employeeDocument.create({
      data: {
        employeeMasterId: createEmployeeDocumentDto.employeeMasterId,
        documentName: createEmployeeDocumentDto.documentName,
        documentType: createEmployeeDocumentDto.documentType,
        documentCategory: createEmployeeDocumentDto.documentCategory,
        fileSize: createEmployeeDocumentDto.fileSize,
        fileUrl: createEmployeeDocumentDto.fileUrl,
        uploadDate,
        expiryDate: createEmployeeDocumentDto.expiryDate ? new Date(createEmployeeDocumentDto.expiryDate) : null,
        uploadedBy: createEmployeeDocumentDto.uploadedBy,
        status: createEmployeeDocumentDto.status || 'ACTIVE',
        description: createEmployeeDocumentDto.description,
        version: createEmployeeDocumentDto.version || '1.0',
        isConfidential: createEmployeeDocumentDto.isConfidential || false,
      },
      include: {
        employeeMaster: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    // Fetch user name if uploadedBy exists
    let userMap = new Map<string, string>()
    if (document.uploadedBy) {
      const user = await this.prisma.user.findUnique({
        where: { id: document.uploadedBy },
        select: { id: true, name: true },
      })
      if (user) {
        userMap.set(user.id, user.name)
      }
    }

    return this.formatDocumentResponse(document, departmentName, designationName, userMap)
  }

  async findAll(employeeMasterId?: string, documentCategory?: string, status?: string, search?: string) {
    const where: any = {}

    if (employeeMasterId) {
      where.employeeMasterId = employeeMasterId
    }

    if (documentCategory) {
      where.documentCategory = documentCategory
    }

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        {
          documentName: { contains: search, mode: 'insensitive' },
        },
        {
          employeeMaster: {
            firstName: { contains: search, mode: 'insensitive' },
          },
        },
        {
          employeeMaster: {
            lastName: { contains: search, mode: 'insensitive' },
          },
        },
        {
          employeeMaster: {
            employeeCode: { contains: search, mode: 'insensitive' },
          },
        },
      ]
    }

    const documents = await this.prisma.employeeDocument.findMany({
      where,
      include: {
        employeeMaster: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { uploadDate: 'desc' },
    })

    // Fetch user names for uploadedBy fields
    const userIds: string[] = documents
      .map(doc => doc.uploadedBy)
      .filter((id): id is string => id !== null && id !== undefined)
    const uniqueUserIds = [...new Set(userIds)]
    
    const users = uniqueUserIds.length > 0
      ? await this.prisma.user.findMany({
          where: { id: { in: uniqueUserIds } },
          select: { id: true, name: true },
        })
      : []
    
    const userMap = new Map(users.map(u => [u.id, u.name]))

    // Format each response with department and designation names
    const formattedResults = await Promise.all(
      documents.map(async (doc) => {
        let departmentName = ''
        let designationName = ''

        if (doc.employeeMaster.departmentId) {
          const department = await this.prisma.department.findUnique({
            where: { id: doc.employeeMaster.departmentId },
          })
          departmentName = department?.departmentName || ''
        }

        if (doc.employeeMaster.designationId) {
          const designation = await this.prisma.designation.findUnique({
            where: { id: doc.employeeMaster.designationId },
          })
          designationName = designation?.designationName || ''
        }

        return this.formatDocumentResponse(doc, departmentName, designationName, userMap)
      })
    )

    return formattedResults
  }

  async findOne(id: string) {
    const document = await this.prisma.employeeDocument.findUnique({
      where: { id },
      include: {
        employeeMaster: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!document) {
      throw new NotFoundException('Document not found')
    }

    // Get department and designation names
    let departmentName = ''
    let designationName = ''

    if (document.employeeMaster.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: document.employeeMaster.departmentId },
      })
      departmentName = department?.departmentName || ''
    }

    if (document.employeeMaster.designationId) {
      const designation = await this.prisma.designation.findUnique({
        where: { id: document.employeeMaster.designationId },
      })
      designationName = designation?.designationName || ''
    }

    // Fetch user name if uploadedBy exists
    let userMap = new Map<string, string>()
    if (document.uploadedBy) {
      const user = await this.prisma.user.findUnique({
        where: { id: document.uploadedBy },
        select: { id: true, name: true },
      })
      if (user) {
        userMap.set(user.id, user.name)
      }
    }

    return this.formatDocumentResponse(document, departmentName, designationName, userMap)
  }

  async update(id: string, updateEmployeeDocumentDto: UpdateEmployeeDocumentDto) {
    const document = await this.prisma.employeeDocument.findUnique({
      where: { id },
    })

    if (!document) {
      throw new NotFoundException('Document not found')
    }

    const updateData: any = {}

    if (updateEmployeeDocumentDto.documentName !== undefined) {
      updateData.documentName = updateEmployeeDocumentDto.documentName
    }

    if (updateEmployeeDocumentDto.documentCategory !== undefined) {
      updateData.documentCategory = updateEmployeeDocumentDto.documentCategory
    }

    if (updateEmployeeDocumentDto.expiryDate !== undefined) {
      updateData.expiryDate = updateEmployeeDocumentDto.expiryDate ? new Date(updateEmployeeDocumentDto.expiryDate) : null
    }

    if (updateEmployeeDocumentDto.status !== undefined) {
      updateData.status = updateEmployeeDocumentDto.status
    }

    if (updateEmployeeDocumentDto.description !== undefined) {
      updateData.description = updateEmployeeDocumentDto.description
    }

    if (updateEmployeeDocumentDto.version !== undefined) {
      updateData.version = updateEmployeeDocumentDto.version
    }

    if (updateEmployeeDocumentDto.isConfidential !== undefined) {
      updateData.isConfidential = updateEmployeeDocumentDto.isConfidential
    }

    // Check if document is expired
    if (document.expiryDate && new Date(document.expiryDate) < new Date() && updateData.status !== 'EXPIRED') {
      updateData.status = 'EXPIRED'
    }

    const updated = await this.prisma.employeeDocument.update({
      where: { id },
      data: updateData,
      include: {
        employeeMaster: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
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

    // Fetch user name if uploadedBy exists
    let userMap = new Map<string, string>()
    if (updated.uploadedBy) {
      const user = await this.prisma.user.findUnique({
        where: { id: updated.uploadedBy },
        select: { id: true, name: true },
      })
      if (user) {
        userMap.set(user.id, user.name)
      }
    }

    return this.formatDocumentResponse(updated, departmentName, designationName, userMap)
  }

  async archive(id: string) {
    const document = await this.prisma.employeeDocument.findUnique({
      where: { id },
    })

    if (!document) {
      throw new NotFoundException('Document not found')
    }

    const updated = await this.prisma.employeeDocument.update({
      where: { id },
      data: { status: 'ARCHIVED' },
      include: {
        employeeMaster: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
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

    // Fetch user name if uploadedBy exists
    let userMap = new Map<string, string>()
    if (updated.uploadedBy) {
      const user = await this.prisma.user.findUnique({
        where: { id: updated.uploadedBy },
        select: { id: true, name: true },
      })
      if (user) {
        userMap.set(user.id, user.name)
      }
    }

    return this.formatDocumentResponse(updated, departmentName, designationName, userMap)
  }

  async activate(id: string) {
    const document = await this.prisma.employeeDocument.findUnique({
      where: { id },
    })

    if (!document) {
      throw new NotFoundException('Document not found')
    }

    const updated = await this.prisma.employeeDocument.update({
      where: { id },
      data: { status: 'ACTIVE' },
      include: {
        employeeMaster: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
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

    // Fetch user name if uploadedBy exists
    let userMap = new Map<string, string>()
    if (updated.uploadedBy) {
      const user = await this.prisma.user.findUnique({
        where: { id: updated.uploadedBy },
        select: { id: true, name: true },
      })
      if (user) {
        userMap.set(user.id, user.name)
      }
    }

    return this.formatDocumentResponse(updated, departmentName, designationName, userMap)
  }

  async remove(id: string) {
    const document = await this.prisma.employeeDocument.findUnique({
      where: { id },
    })

    if (!document) {
      throw new NotFoundException('Document not found')
    }

    await this.prisma.employeeDocument.delete({
      where: { id },
    })
  }

  private formatDocumentResponse(doc: any, departmentName: string, designationName: string, userMap?: Map<string, string>) {
    // Get uploaded by name if available
    let uploadedByName = 'System'
    if (doc.uploadedBy) {
      if (userMap && userMap.has(doc.uploadedBy)) {
        uploadedByName = userMap.get(doc.uploadedBy) || 'System'
      } else {
        // Fallback to ID if user not found (shouldn't happen, but safe fallback)
        uploadedByName = doc.uploadedBy
      }
    }

    return {
      id: doc.id,
      employeeId: doc.employeeMasterId,
      employeeCode: doc.employeeMaster.employeeCode,
      employeeName: `${doc.employeeMaster.firstName} ${doc.employeeMaster.lastName}`,
      departmentName,
      designationName,
      documentName: doc.documentName,
      documentType: doc.documentType,
      documentCategory: doc.documentCategory,
      fileSize: doc.fileSize,
      uploadDate: doc.uploadDate.toISOString().split('T')[0],
      expiryDate: doc.expiryDate ? doc.expiryDate.toISOString().split('T')[0] : null,
      uploadedBy: uploadedByName,
      status: doc.status === 'ACTIVE' ? 'Active' :
              doc.status === 'ARCHIVED' ? 'Archived' : 'Expired',
      description: doc.description,
      fileUrl: doc.fileUrl,
      version: doc.version,
      isConfidential: doc.isConfidential,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }
  }
}

