import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateKYCVerificationDto } from './dto/create-kyc-verification.dto'
import { UpdateKYCVerificationDto } from './dto/update-kyc-verification.dto'
import { UpdateKYCDocumentDto } from './dto/update-kyc-document.dto'

@Injectable()
export class KYCVerificationsService {
  constructor(private prisma: PrismaService) {}

  async create(createKYCVerificationDto: CreateKYCVerificationDto) {
    // Verify employee exists
    const employee = await this.prisma.employeeMaster.findUnique({
      where: { id: createKYCVerificationDto.employeeMasterId },
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

    const submittedDate = createKYCVerificationDto.submittedDate
      ? new Date(createKYCVerificationDto.submittedDate)
      : new Date()

    const kycVerification = await this.prisma.kYCVerification.create({
      data: {
        employeeMasterId: createKYCVerificationDto.employeeMasterId,
        verificationStatus: createKYCVerificationDto.verificationStatus || 'PENDING',
        submittedDate,
        overallRemarks: createKYCVerificationDto.overallRemarks,
        documents: {
          create: createKYCVerificationDto.documents.map((doc) => ({
            documentType: doc.documentType,
            documentNumber: doc.documentNumber,
            issueDate: new Date(doc.issueDate),
            expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : null,
            issuingAuthority: doc.issuingAuthority,
            documentFile: doc.documentFile,
            status: doc.status || 'PENDING',
            remarks: doc.remarks,
          })),
        },
      },
      include: {
        documents: true,
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

    return this.formatKYCResponse(kycVerification, departmentName, designationName)
  }

  async findAll(employeeMasterId?: string, verificationStatus?: string, search?: string) {
    const where: any = {}

    if (employeeMasterId) {
      where.employeeMasterId = employeeMasterId
    }

    if (verificationStatus) {
      where.verificationStatus = verificationStatus as any
    }

    if (search) {
      where.OR = [
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

    const kycVerifications = await this.prisma.kYCVerification.findMany({
      where,
      include: {
        documents: true,
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
      orderBy: { submittedDate: 'desc' },
    })

    // Format each response with department and designation names
    const formattedResults = await Promise.all(
      kycVerifications.map(async (kyc) => {
        let departmentName = ''
        let designationName = ''

        if (kyc.employeeMaster.departmentId) {
          const department = await this.prisma.department.findUnique({
            where: { id: kyc.employeeMaster.departmentId },
          })
          departmentName = department?.departmentName || ''
        }

        if (kyc.employeeMaster.designationId) {
          const designation = await this.prisma.designation.findUnique({
            where: { id: kyc.employeeMaster.designationId },
          })
          designationName = designation?.designationName || ''
        }

        return this.formatKYCResponse(kyc, departmentName, designationName)
      })
    )

    return formattedResults
  }

  async findOne(id: string) {
    const kycVerification = await this.prisma.kYCVerification.findUnique({
      where: { id },
      include: {
        documents: true,
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

    if (!kycVerification) {
      throw new NotFoundException('KYC verification not found')
    }

    // Get department and designation names
    let departmentName = ''
    let designationName = ''

    if (kycVerification.employeeMaster.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: kycVerification.employeeMaster.departmentId },
      })
      departmentName = department?.departmentName || ''
    }

    if (kycVerification.employeeMaster.designationId) {
      const designation = await this.prisma.designation.findUnique({
        where: { id: kycVerification.employeeMaster.designationId },
      })
      designationName = designation?.designationName || ''
    }

    return this.formatKYCResponse(kycVerification, departmentName, designationName)
  }

  async update(id: string, updateKYCVerificationDto: UpdateKYCVerificationDto) {
    const kycVerification = await this.prisma.kYCVerification.findUnique({
      where: { id },
    })

    if (!kycVerification) {
      throw new NotFoundException('KYC verification not found')
    }

    const updateData: any = {}

    if (updateKYCVerificationDto.verificationStatus !== undefined) {
      updateData.verificationStatus = updateKYCVerificationDto.verificationStatus
    }

    if (updateKYCVerificationDto.verifiedBy !== undefined) {
      updateData.verifiedBy = updateKYCVerificationDto.verifiedBy
    }

    if (updateKYCVerificationDto.verifiedDate !== undefined) {
      updateData.verifiedDate = new Date(updateKYCVerificationDto.verifiedDate)
    } else if (updateKYCVerificationDto.verificationStatus === 'VERIFIED' && !kycVerification.verifiedDate) {
      updateData.verifiedDate = new Date()
    }

    if (updateKYCVerificationDto.overallRemarks !== undefined) {
      updateData.overallRemarks = updateKYCVerificationDto.overallRemarks
    }

    const updated = await this.prisma.kYCVerification.update({
      where: { id },
      data: updateData,
      include: {
        documents: true,
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

    return this.formatKYCResponse(updated, departmentName, designationName)
  }

  async verify(id: string, verifiedBy: string) {
    const kycVerification = await this.prisma.kYCVerification.findUnique({
      where: { id },
    })

    if (!kycVerification) {
      throw new NotFoundException('KYC verification not found')
    }

    const updated = await this.prisma.kYCVerification.update({
      where: { id },
      data: {
        verificationStatus: 'VERIFIED',
        verifiedBy,
        verifiedDate: new Date(),
      },
      include: {
        documents: true,
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

    return this.formatKYCResponse(updated, departmentName, designationName)
  }

  async remove(id: string) {
    const kycVerification = await this.prisma.kYCVerification.findUnique({
      where: { id },
    })

    if (!kycVerification) {
      throw new NotFoundException('KYC verification not found')
    }

    await this.prisma.kYCVerification.delete({
      where: { id },
    })
  }

  private formatKYCResponse(kyc: any, departmentName: string, designationName: string) {
    return {
      id: kyc.id,
      employeeId: kyc.employeeMasterId,
      employeeCode: kyc.employeeMaster.employeeCode,
      employeeName: `${kyc.employeeMaster.firstName} ${kyc.employeeMaster.lastName}`,
      departmentName,
      designationName,
      documents: kyc.documents.map((doc: any) => ({
        id: doc.id,
        documentType: doc.documentType,
        documentNumber: doc.documentNumber,
        issueDate: doc.issueDate.toISOString().split('T')[0],
        expiryDate: doc.expiryDate ? doc.expiryDate.toISOString().split('T')[0] : null,
        issuingAuthority: doc.issuingAuthority,
        documentFile: doc.documentFile,
        status: doc.status === 'VERIFIED' ? 'Verified' :
                doc.status === 'PENDING' ? 'Pending' :
                doc.status === 'REJECTED' ? 'Rejected' : 'Expired',
        verifiedBy: doc.verifiedBy,
        verifiedDate: doc.verifiedDate ? doc.verifiedDate.toISOString().split('T')[0] : null,
        rejectionReason: doc.rejectionReason,
        remarks: doc.remarks,
      })),
      verificationStatus: kyc.verificationStatus === 'VERIFIED' ? 'Verified' :
                          kyc.verificationStatus === 'IN_PROGRESS' ? 'In Progress' :
                          kyc.verificationStatus === 'REJECTED' ? 'Rejected' : 'Pending',
      submittedDate: kyc.submittedDate.toISOString().split('T')[0],
      verifiedDate: kyc.verifiedDate ? kyc.verifiedDate.toISOString().split('T')[0] : null,
      verifiedBy: kyc.verifiedBy,
      overallRemarks: kyc.overallRemarks,
      createdAt: kyc.createdAt,
      updatedAt: kyc.updatedAt,
    }
  }

  async updateDocument(kycVerificationId: string, documentId: string, updateDocumentDto: UpdateKYCDocumentDto, verifiedBy?: string) {
    // Verify KYC verification exists
    const kycVerification = await this.prisma.kYCVerification.findUnique({
      where: { id: kycVerificationId },
    })

    if (!kycVerification) {
      throw new NotFoundException('KYC verification not found')
    }

    // Verify document exists and belongs to this KYC verification
    const document = await this.prisma.kYCDocument.findFirst({
      where: {
        id: documentId,
        kycVerificationId: kycVerificationId,
      },
    })

    if (!document) {
      throw new NotFoundException('Document not found')
    }

    const updateData: any = {}

    if (updateDocumentDto.status !== undefined) {
      updateData.status = updateDocumentDto.status
    }

    if (updateDocumentDto.verifiedBy !== undefined) {
      updateData.verifiedBy = updateDocumentDto.verifiedBy
    } else if (updateDocumentDto.status === 'VERIFIED' && verifiedBy) {
      updateData.verifiedBy = verifiedBy
    }

    if (updateDocumentDto.verifiedDate !== undefined) {
      updateData.verifiedDate = new Date(updateDocumentDto.verifiedDate)
    } else if (updateDocumentDto.status === 'VERIFIED' && !document.verifiedDate) {
      updateData.verifiedDate = new Date()
    }

    if (updateDocumentDto.rejectionReason !== undefined) {
      updateData.rejectionReason = updateDocumentDto.rejectionReason
    }

    if (updateDocumentDto.remarks !== undefined) {
      updateData.remarks = updateDocumentDto.remarks
    }

    const updatedDocument = await this.prisma.kYCDocument.update({
      where: { id: documentId },
      data: updateData,
    })

    // Get the updated KYC verification with all documents
    const updatedKYC = await this.prisma.kYCVerification.findUnique({
      where: { id: kycVerificationId },
      include: {
        documents: true,
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

    if (updatedKYC.employeeMaster.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: updatedKYC.employeeMaster.departmentId },
      })
      departmentName = department?.departmentName || ''
    }

    if (updatedKYC.employeeMaster.designationId) {
      const designation = await this.prisma.designation.findUnique({
        where: { id: updatedKYC.employeeMaster.designationId },
      })
      designationName = designation?.designationName || ''
    }

    return this.formatKYCResponse(updatedKYC, departmentName, designationName)
  }
}

