import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateIDCardTemplateDto } from './dto/create-id-card-template.dto'
import { UpdateIDCardTemplateDto } from './dto/update-id-card-template.dto'

@Injectable()
export class IDCardTemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateIDCardTemplateDto) {
    const templateCode = createDto.templateCode || `TEMP-${Date.now().toString().slice(-6)}`
    
    const template = await this.prisma.iDCardTemplate.create({
      data: {
        templateName: createDto.templateName,
        templateCode,
        backgroundColor: createDto.backgroundColor || '#ffffff',
        textColor: createDto.textColor || '#1a1a1a',
        accentColor: createDto.accentColor || '#667eea',
        logoPosition: createDto.logoPosition || 'left',
        photoPosition: createDto.photoPosition || 'right',
        ...(createDto.logoUrl !== undefined && { logoUrl: createDto.logoUrl }),
        ...(createDto.companyName !== undefined && { companyName: createDto.companyName }),
        ...(createDto.companyAddress !== undefined && { companyAddress: createDto.companyAddress }),
        ...(createDto.showEmployeePhoto !== undefined && { showEmployeePhoto: createDto.showEmployeePhoto }),
        showQRCode: createDto.showQRCode !== false,
        showDepartment: createDto.showDepartment !== false,
        showDesignation: createDto.showDesignation !== false,
        showEmployeeCode: createDto.showEmployeeCode !== false,
        showJoiningDate: createDto.showJoiningDate || false,
        showExpiryDate: createDto.showExpiryDate !== false,
        isDefault: createDto.isDefault || false,
      },
    })

    return this.formatResponse(template)
  }

  async findAll() {
    const templates = await this.prisma.iDCardTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return templates.map(t => this.formatResponse(t))
  }

  async findOne(id: string) {
    const template = await this.prisma.iDCardTemplate.findUnique({ where: { id } })
    if (!template) {
      throw new NotFoundException('ID Card template not found')
    }
    return this.formatResponse(template)
  }

  async update(id: string, updateDto: UpdateIDCardTemplateDto) {
    const template = await this.prisma.iDCardTemplate.findUnique({ where: { id } })
    if (!template) {
      throw new NotFoundException('ID Card template not found')
    }

    const updated = await this.prisma.iDCardTemplate.update({
      where: { id },
      data: {
        ...(updateDto.templateName !== undefined && { templateName: updateDto.templateName }),
        ...(updateDto.backgroundColor !== undefined && { backgroundColor: updateDto.backgroundColor }),
        ...(updateDto.textColor !== undefined && { textColor: updateDto.textColor }),
        ...(updateDto.accentColor !== undefined && { accentColor: updateDto.accentColor }),
        ...(updateDto.logoPosition !== undefined && { logoPosition: updateDto.logoPosition }),
        ...(updateDto.photoPosition !== undefined && { photoPosition: updateDto.photoPosition }),
        ...(updateDto.logoUrl !== undefined && { logoUrl: updateDto.logoUrl }),
        ...(updateDto.companyName !== undefined && { companyName: updateDto.companyName }),
        ...(updateDto.companyAddress !== undefined && { companyAddress: updateDto.companyAddress }),
        ...(updateDto.showEmployeePhoto !== undefined && { showEmployeePhoto: updateDto.showEmployeePhoto }),
        ...(updateDto.showQRCode !== undefined && { showQRCode: updateDto.showQRCode }),
        ...(updateDto.showDepartment !== undefined && { showDepartment: updateDto.showDepartment }),
        ...(updateDto.showDesignation !== undefined && { showDesignation: updateDto.showDesignation }),
        ...(updateDto.showEmployeeCode !== undefined && { showEmployeeCode: updateDto.showEmployeeCode }),
        ...(updateDto.showJoiningDate !== undefined && { showJoiningDate: updateDto.showJoiningDate }),
        ...(updateDto.showExpiryDate !== undefined && { showExpiryDate: updateDto.showExpiryDate }),
        ...(updateDto.isDefault !== undefined && { isDefault: updateDto.isDefault }),
      },
    })

    return this.formatResponse(updated)
  }

  async remove(id: string) {
    const template = await this.prisma.iDCardTemplate.findUnique({ where: { id } })
    if (!template) {
      throw new NotFoundException('ID Card template not found')
    }
    await this.prisma.iDCardTemplate.delete({ where: { id } })
  }

  private formatResponse(template: any) {
    return {
      id: template.id,
      templateName: template.templateName,
      templateCode: template.templateCode,
      backgroundColor: template.backgroundColor,
      textColor: template.textColor,
      accentColor: template.accentColor,
      logoPosition: template.logoPosition,
      photoPosition: template.photoPosition,
      logoUrl: template.logoUrl || null,
      companyName: template.companyName || null,
      companyAddress: template.companyAddress || null,
      showEmployeePhoto: template.showEmployeePhoto !== false,
      showQRCode: template.showQRCode,
      showDepartment: template.showDepartment,
      showDesignation: template.showDesignation,
      showEmployeeCode: template.showEmployeeCode,
      showJoiningDate: template.showJoiningDate,
      showExpiryDate: template.showExpiryDate,
      isDefault: template.isDefault,
      createdDate: template.createdDate.toISOString().split('T')[0],
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    }
  }
}

