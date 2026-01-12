import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateNotificationTemplateDto } from './dto/create-notification-template.dto'
import { UpdateNotificationTemplateDto } from './dto/update-notification-template.dto'

@Injectable()
export class NotificationTemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateNotificationTemplateDto, createdBy: string) {
    const template = await this.prisma.notificationTemplate.create({
      data: {
        templateName: createDto.templateName,
        templateCode: createDto.templateCode,
        notificationType: createDto.notificationType,
        subject: createDto.subject,
        message: createDto.message,
        variables: createDto.variables || [],
        category: createDto.category,
        isActive: createDto.isActive ?? true,
        createdBy,
      },
    })

    return this.formatResponse(template)
  }

  async findAll(
    notificationType?: string,
    category?: string,
    isActive?: boolean,
    search?: string,
  ) {
    const where: any = {}

    if (notificationType) {
      where.notificationType = notificationType.toUpperCase()
    }

    if (category) {
      where.category = category.toUpperCase()
    }

    if (isActive !== undefined) {
      where.isActive = isActive
    }

    if (search) {
      where.OR = [
        { templateName: { contains: search, mode: 'insensitive' } },
        { templateCode: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ]
    }

    const templates = await this.prisma.notificationTemplate.findMany({
      where,
      orderBy: {
        createdDate: 'desc',
      },
    })

    return templates.map((template) => this.formatResponse(template))
  }

  async findOne(id: string) {
    const template = await this.prisma.notificationTemplate.findUnique({
      where: { id },
    })

    if (!template) {
      throw new NotFoundException('Notification template not found')
    }

    return this.formatResponse(template)
  }

  async update(id: string, updateDto: UpdateNotificationTemplateDto) {
    const template = await this.prisma.notificationTemplate.findUnique({
      where: { id },
    })

    if (!template) {
      throw new NotFoundException('Notification template not found')
    }

    const updated = await this.prisma.notificationTemplate.update({
      where: { id },
      data: {
        ...(updateDto.templateName && { templateName: updateDto.templateName }),
        ...(updateDto.templateCode && { templateCode: updateDto.templateCode }),
        ...(updateDto.notificationType && { notificationType: updateDto.notificationType }),
        ...(updateDto.subject !== undefined && { subject: updateDto.subject }),
        ...(updateDto.message && { message: updateDto.message }),
        ...(updateDto.variables !== undefined && { variables: updateDto.variables }),
        ...(updateDto.category && { category: updateDto.category }),
        ...(updateDto.isActive !== undefined && { isActive: updateDto.isActive }),
        lastModified: new Date(),
      },
    })

    return this.formatResponse(updated)
  }

  async remove(id: string) {
    const template = await this.prisma.notificationTemplate.findUnique({
      where: { id },
    })

    if (!template) {
      throw new NotFoundException('Notification template not found')
    }

    await this.prisma.notificationTemplate.delete({
      where: { id },
    })
  }

  async duplicate(id: string, createdBy: string) {
    const template = await this.prisma.notificationTemplate.findUnique({
      where: { id },
    })

    if (!template) {
      throw new NotFoundException('Notification template not found')
    }

    const duplicated = await this.prisma.notificationTemplate.create({
      data: {
        templateName: `${template.templateName} (Copy)`,
        templateCode: `${template.templateCode}-COPY-${Date.now()}`,
        notificationType: template.notificationType,
        subject: template.subject,
        message: template.message,
        variables: template.variables,
        category: template.category,
        isActive: false,
        createdBy,
      },
    })

    return this.formatResponse(duplicated)
  }

  async incrementUsage(id: string) {
    await this.prisma.notificationTemplate.update({
      where: { id },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    })
  }

  private formatResponse(template: any) {
    return {
      id: template.id,
      templateName: template.templateName,
      templateCode: template.templateCode,
      notificationType: template.notificationType,
      subject: template.subject,
      message: template.message,
      variables: template.variables,
      category: template.category,
      isActive: template.isActive,
      usageCount: template.usageCount,
      createdBy: template.createdBy,
      createdDate: template.createdDate.toISOString().split('T')[0],
      lastModified: template.lastModified?.toISOString().split('T')[0],
    }
  }
}

