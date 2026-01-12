import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateJobOpeningDto } from './dto/create-job-opening.dto'
import { UpdateJobOpeningDto } from './dto/update-job-opening.dto'

@Injectable()
export class JobOpeningsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateJobOpeningDto) {
    // Check if job code already exists
    const existing = await this.prisma.jobOpening.findUnique({
      where: { jobCode: createDto.jobCode },
    })

    if (existing) {
      throw new Error('Job code already exists')
    }

    // Verify department exists if provided
    if (createDto.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: createDto.departmentId },
      })
      if (!department) {
        throw new NotFoundException('Department not found')
      }
    }

    // Verify designation exists if provided
    if (createDto.designationId) {
      const designation = await this.prisma.designation.findUnique({
        where: { id: createDto.designationId },
      })
      if (!designation) {
        throw new NotFoundException('Designation not found')
      }
    }

    return this.prisma.jobOpening.create({
      data: {
        jobTitle: createDto.jobTitle,
        jobCode: createDto.jobCode,
        departmentId: createDto.departmentId,
        designationId: createDto.designationId,
        employmentType: createDto.employmentType || 'FULL_TIME',
        jobLocation: createDto.jobLocation,
        numberOfOpenings: createDto.numberOfOpenings,
        minExperience: createDto.minExperience,
        maxExperience: createDto.maxExperience,
        education: createDto.education,
        skills: createDto.skills,
        minSalary: createDto.minSalary,
        maxSalary: createDto.maxSalary,
        salaryCurrency: createDto.salaryCurrency || 'INR',
        jobDescription: createDto.jobDescription,
        responsibilities: createDto.responsibilities,
        requirements: createDto.requirements,
        benefits: createDto.benefits,
        postedDate: createDto.postedDate ? new Date(createDto.postedDate) : new Date(),
        closingDate: createDto.closingDate ? new Date(createDto.closingDate) : null,
        status: createDto.status || 'DRAFT',
        createdBy: createDto.createdBy,
      },
      include: {
        department: true,
        designation: true,
      },
    })
  }

  async findAll(status?: string, departmentId?: string, search?: string) {
    const where: any = {}
    
    if (status) {
      where.status = status.toUpperCase()
    }
    
    if (departmentId) {
      where.departmentId = departmentId
    }
    
    if (search) {
      where.OR = [
        { jobTitle: { contains: search, mode: 'insensitive' } },
        { jobCode: { contains: search, mode: 'insensitive' } },
        { jobLocation: { contains: search, mode: 'insensitive' } },
        { jobDescription: { contains: search, mode: 'insensitive' } },
      ]
    }

    const jobs = await this.prisma.jobOpening.findMany({
      where,
      include: {
        department: true,
        designation: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Format response
    return jobs.map(job => ({
      id: job.id,
      jobTitle: job.jobTitle,
      jobCode: job.jobCode,
      departmentId: job.departmentId,
      departmentName: job.department?.departmentName || null,
      designationId: job.designationId,
      designationName: job.designation?.designationName || null,
      employmentType: job.employmentType,
      jobLocation: job.jobLocation,
      numberOfOpenings: job.numberOfOpenings,
      minExperience: job.minExperience,
      maxExperience: job.maxExperience,
      education: job.education,
      skills: job.skills,
      minSalary: job.minSalary,
      maxSalary: job.maxSalary,
      salaryCurrency: job.salaryCurrency,
      jobDescription: job.jobDescription,
      responsibilities: job.responsibilities,
      requirements: job.requirements,
      benefits: job.benefits,
      postedDate: job.postedDate.toISOString().split('T')[0],
      closingDate: job.closingDate ? job.closingDate.toISOString().split('T')[0] : null,
      status: job.status,
      createdBy: job.createdBy,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    }))
  }

  async findOne(id: string) {
    const job = await this.prisma.jobOpening.findUnique({
      where: { id },
      include: {
        department: true,
        designation: true,
      },
    })

    if (!job) {
      throw new NotFoundException('Job opening not found')
    }

    return {
      id: job.id,
      jobTitle: job.jobTitle,
      jobCode: job.jobCode,
      departmentId: job.departmentId,
      departmentName: job.department?.departmentName || null,
      designationId: job.designationId,
      designationName: job.designation?.designationName || null,
      employmentType: job.employmentType,
      jobLocation: job.jobLocation,
      numberOfOpenings: job.numberOfOpenings,
      minExperience: job.minExperience,
      maxExperience: job.maxExperience,
      education: job.education,
      skills: job.skills,
      minSalary: job.minSalary,
      maxSalary: job.maxSalary,
      salaryCurrency: job.salaryCurrency,
      jobDescription: job.jobDescription,
      responsibilities: job.responsibilities,
      requirements: job.requirements,
      benefits: job.benefits,
      postedDate: job.postedDate.toISOString().split('T')[0],
      closingDate: job.closingDate ? job.closingDate.toISOString().split('T')[0] : null,
      status: job.status,
      createdBy: job.createdBy,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    }
  }

  async update(id: string, updateDto: UpdateJobOpeningDto) {
    const job = await this.prisma.jobOpening.findUnique({ where: { id } })
    
    if (!job) {
      throw new NotFoundException('Job opening not found')
    }

    // Check if job code is being updated and if it conflicts
    if (updateDto.jobCode && updateDto.jobCode !== job.jobCode) {
      const existing = await this.prisma.jobOpening.findUnique({
        where: { jobCode: updateDto.jobCode },
      })

      if (existing) {
        throw new Error('Job code already exists')
      }
    }

    // Verify department exists if provided
    if (updateDto.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: updateDto.departmentId },
      })
      if (!department) {
        throw new NotFoundException('Department not found')
      }
    }

    // Verify designation exists if provided
    if (updateDto.designationId) {
      const designation = await this.prisma.designation.findUnique({
        where: { id: updateDto.designationId },
      })
      if (!designation) {
        throw new NotFoundException('Designation not found')
      }
    }

    const updateData: any = { ...updateDto }
    
    if (updateDto.postedDate) {
      updateData.postedDate = new Date(updateDto.postedDate)
    }
    
    if (updateDto.closingDate !== undefined) {
      updateData.closingDate = updateDto.closingDate ? new Date(updateDto.closingDate) : null
    }

    const updated = await this.prisma.jobOpening.update({
      where: { id },
      data: updateData,
      include: {
        department: true,
        designation: true,
      },
    })

    return {
      id: updated.id,
      jobTitle: updated.jobTitle,
      jobCode: updated.jobCode,
      departmentId: updated.departmentId,
      departmentName: updated.department?.departmentName || null,
      designationId: updated.designationId,
      designationName: updated.designation?.designationName || null,
      employmentType: updated.employmentType,
      jobLocation: updated.jobLocation,
      numberOfOpenings: updated.numberOfOpenings,
      minExperience: updated.minExperience,
      maxExperience: updated.maxExperience,
      education: updated.education,
      skills: updated.skills,
      minSalary: updated.minSalary,
      maxSalary: updated.maxSalary,
      salaryCurrency: updated.salaryCurrency,
      jobDescription: updated.jobDescription,
      responsibilities: updated.responsibilities,
      requirements: updated.requirements,
      benefits: updated.benefits,
      postedDate: updated.postedDate.toISOString().split('T')[0],
      closingDate: updated.closingDate ? updated.closingDate.toISOString().split('T')[0] : null,
      status: updated.status,
      createdBy: updated.createdBy,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    }
  }

  async remove(id: string) {
    const job = await this.prisma.jobOpening.findUnique({ where: { id } })
    
    if (!job) {
      throw new NotFoundException('Job opening not found')
    }

    return this.prisma.jobOpening.delete({ where: { id } })
  }
}


