import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateSalaryTemplateDto } from './dto/create-salary-template.dto'
import { UpdateSalaryTemplateDto } from './dto/update-salary-template.dto'
import { Prisma } from '@prisma/client'

@Injectable()
export class SalaryTemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(createSalaryTemplateDto: CreateSalaryTemplateDto) {
    // Check if template code already exists
    const existing = await this.prisma.salaryTemplate.findUnique({
      where: { templateCode: createSalaryTemplateDto.templateCode },
    })

    if (existing) {
      throw new BadRequestException('Template code already exists')
    }

    return this.prisma.salaryTemplate.create({
      data: {
        ...createSalaryTemplateDto,
        components: createSalaryTemplateDto.components as unknown as Prisma.InputJsonValue,
        isActive: createSalaryTemplateDto.isActive ?? true,
      },
    })
  }

  async findAll(isActive?: boolean) {
    const where = isActive !== undefined ? { isActive } : {}
    const templates = await this.prisma.salaryTemplate.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Note: employeeCount would need to be calculated from Employee/User model if it exists
    // For now, returning 0 as placeholder
    return templates.map(template => ({
      ...template,
      employeeCount: 0, // TODO: Calculate from Employee/User model when available
    }))
  }

  async findOne(id: string) {
    const template = await this.prisma.salaryTemplate.findUnique({
      where: { id },
    })

    if (!template) {
      throw new NotFoundException('Salary template not found')
    }

    return {
      ...template,
      employeeCount: 0, // TODO: Calculate from Employee/User model when available
    }
  }

  async update(id: string, updateSalaryTemplateDto: UpdateSalaryTemplateDto) {
    const template = await this.prisma.salaryTemplate.findUnique({
      where: { id },
    })

    if (!template) {
      throw new NotFoundException('Salary template not found')
    }

    // Check if template code is being updated and if it conflicts
    if (updateSalaryTemplateDto.templateCode && updateSalaryTemplateDto.templateCode !== template.templateCode) {
      const existing = await this.prisma.salaryTemplate.findUnique({
        where: { templateCode: updateSalaryTemplateDto.templateCode },
      })

      if (existing) {
        throw new BadRequestException('Template code already exists')
      }
    }

    const updateData: any = { ...updateSalaryTemplateDto }
    if (updateSalaryTemplateDto.components) {
      updateData.components = updateSalaryTemplateDto.components as unknown as Prisma.InputJsonValue
    }

    return this.prisma.salaryTemplate.update({
      where: { id },
      data: updateData,
    })
  }

  async remove(id: string) {
    const template = await this.prisma.salaryTemplate.findUnique({
      where: { id },
    })

    if (!template) {
      throw new NotFoundException('Salary template not found')
    }

    // TODO: Check if employees exist for this template before deletion
    // For now, allowing deletion
    // if (employeeCount > 0) {
    //   throw new BadRequestException(`Cannot delete template. ${employeeCount} employee(s) are using this template.`)
    // }

    return this.prisma.salaryTemplate.delete({
      where: { id },
    })
  }

  async toggleActive(id: string) {
    const template = await this.prisma.salaryTemplate.findUnique({
      where: { id },
    })

    if (!template) {
      throw new NotFoundException('Salary template not found')
    }

    return this.prisma.salaryTemplate.update({
      where: { id },
      data: { isActive: !template.isActive },
    })
  }
}

