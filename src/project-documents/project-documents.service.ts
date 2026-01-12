import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateProjectDocumentDto } from './dto/create-project-document.dto'
import { UpdateProjectDocumentDto } from './dto/update-project-document.dto'

@Injectable()
export class ProjectDocumentsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDocumentDto: CreateProjectDocumentDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: createProjectDocumentDto.projectId },
    })

    if (!project) {
      throw new NotFoundException('Project not found')
    }

    const document = await this.prisma.projectDocument.create({
      data: {
        projectId: createProjectDocumentDto.projectId,
        fileName: createProjectDocumentDto.fileName,
        fileType: createProjectDocumentDto.fileType,
        fileSize: createProjectDocumentDto.fileSize,
        fileUrl: createProjectDocumentDto.fileUrl,
        category: createProjectDocumentDto.category,
        description: createProjectDocumentDto.description,
        version: createProjectDocumentDto.version,
        uploadedBy: createProjectDocumentDto.uploadedBy,
        isActive: createProjectDocumentDto.isActive !== false,
      },
      include: {
        project: true,
      },
    })

    return this.formatDocumentResponse(document)
  }

  async findAll(projectId?: string, category?: string, isActive?: boolean) {
    const where: any = {}
    if (projectId) where.projectId = projectId
    if (category) where.category = category
    if (isActive !== undefined) where.isActive = isActive

    const documents = await this.prisma.projectDocument.findMany({
      where,
      include: {
        project: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return documents.map(doc => this.formatDocumentResponse(doc))
  }

  async findOne(id: string) {
    const document = await this.prisma.projectDocument.findUnique({
      where: { id },
      include: {
        project: true,
      },
    })

    if (!document) {
      throw new NotFoundException('Project document not found')
    }

    return this.formatDocumentResponse(document)
  }

  async update(id: string, updateProjectDocumentDto: UpdateProjectDocumentDto) {
    const document = await this.prisma.projectDocument.findUnique({
      where: { id },
    })

    if (!document) {
      throw new NotFoundException('Project document not found')
    }

    const updated = await this.prisma.projectDocument.update({
      where: { id },
      data: updateProjectDocumentDto,
      include: {
        project: true,
      },
    })

    return this.formatDocumentResponse(updated)
  }

  async remove(id: string) {
    const document = await this.prisma.projectDocument.findUnique({
      where: { id },
    })

    if (!document) {
      throw new NotFoundException('Project document not found')
    }

    await this.prisma.projectDocument.delete({
      where: { id },
    })
  }

  private formatDocumentResponse(doc: any) {
    return {
      id: doc.id,
      projectId: doc.projectId,
      projectName: doc.project.name,
      projectCode: doc.project.code,
      fileName: doc.fileName,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      fileUrl: doc.fileUrl,
      category: doc.category,
      description: doc.description || '',
      version: doc.version,
      uploadedBy: doc.uploadedBy,
      uploadedDate: doc.uploadedDate.toISOString().split('T')[0],
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }
  }
}
