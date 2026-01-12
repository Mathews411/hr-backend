import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateProjectDto } from './dto/create-project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'
import { ProjectStatus } from '@prisma/client'

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto) {
    // Check if project code already exists
    const existingProject = await this.prisma.project.findUnique({
      where: { code: createProjectDto.code },
    })

    if (existingProject) {
      throw new ConflictException('Project with this code already exists')
    }

    // Handle category: if category name is provided, look it up and convert to categoryId
    let categoryId = createProjectDto.categoryId
    if (createProjectDto.category && !categoryId) {
      const category = await this.prisma.projectCategory.findFirst({
        where: {
          OR: [
            { categoryName: createProjectDto.category },
            { categoryName: { equals: createProjectDto.category, mode: 'insensitive' } },
            { categoryCode: createProjectDto.category },
            { categoryCode: { equals: createProjectDto.category, mode: 'insensitive' } },
          ],
          isActive: true,
        },
      })

      if (category) {
        categoryId = category.id
      } else {
        throw new NotFoundException(`Category "${createProjectDto.category}" not found`)
      }
    }

    const project = await this.prisma.project.create({
      data: {
        name: createProjectDto.name,
        code: createProjectDto.code,
        description: createProjectDto.description,
        status: createProjectDto.status || ProjectStatus.ACTIVE,
        startDate: createProjectDto.startDate ? new Date(createProjectDto.startDate) : null,
        endDate: createProjectDto.endDate ? new Date(createProjectDto.endDate) : null,
        categoryId,
        priority: createProjectDto.priority,
        budget: createProjectDto.budget,
        spent: createProjectDto.spent,
        progress: createProjectDto.progress,
        clientName: createProjectDto.clientName,
        location: createProjectDto.location,
      },
      include: {
        category: {
          select: {
            id: true,
            categoryName: true,
            categoryCode: true,
          },
        },
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        managerAssignments: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          take: 1,
          orderBy: {
            assignedDate: 'desc',
          },
        },
        employees: true,
      },
    })

    return this.formatProjectResponse(project)
  }

  async findAll(status?: ProjectStatus) {
    const where = status ? { status } : {}
    
    const projects = await this.prisma.project.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            categoryName: true,
            categoryCode: true,
          },
        },
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        managerAssignments: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          take: 1,
          orderBy: {
            assignedDate: 'desc',
          },
        },
        employees: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return projects.map(project => this.formatProjectResponse(project))
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            categoryName: true,
            categoryCode: true,
          },
        },
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        managerAssignments: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          take: 1,
          orderBy: {
            assignedDate: 'desc',
          },
        },
        employees: true,
      },
    })

    if (!project) {
      throw new NotFoundException('Project not found')
    }

    return this.formatProjectResponse(project)
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const existingProject = await this.prisma.project.findUnique({
      where: { id },
    })

    if (!existingProject) {
      throw new NotFoundException('Project not found')
    }

    // Check if code is being updated and if it conflicts
    if (updateProjectDto.code && updateProjectDto.code !== existingProject.code) {
      const codeExists = await this.prisma.project.findUnique({
        where: { code: updateProjectDto.code },
      })

      if (codeExists) {
        throw new ConflictException('Project with this code already exists')
      }
    }

    // Handle category: if category name is provided, look it up and convert to categoryId
    let categoryId = updateProjectDto.categoryId
    if (updateProjectDto.category !== undefined && !categoryId) {
      if (updateProjectDto.category === null) {
        categoryId = null
      } else {
        const category = await this.prisma.projectCategory.findFirst({
          where: {
            OR: [
              { categoryName: updateProjectDto.category },
              { categoryName: { equals: updateProjectDto.category, mode: 'insensitive' } },
              { categoryCode: updateProjectDto.category },
              { categoryCode: { equals: updateProjectDto.category, mode: 'insensitive' } },
            ],
            isActive: true,
          },
        })

        if (category) {
          categoryId = category.id
        } else {
          throw new NotFoundException(`Category "${updateProjectDto.category}" not found`)
        }
      }
    }

    const project = await this.prisma.project.update({
      where: { id },
      data: {
        ...(updateProjectDto.name && { name: updateProjectDto.name }),
        ...(updateProjectDto.code && { code: updateProjectDto.code }),
        ...(updateProjectDto.description !== undefined && { description: updateProjectDto.description }),
        ...(updateProjectDto.status && { status: updateProjectDto.status }),
        ...(updateProjectDto.startDate && { startDate: new Date(updateProjectDto.startDate) }),
        ...(updateProjectDto.endDate && { endDate: new Date(updateProjectDto.endDate) }),
        ...(categoryId !== undefined && { categoryId }),
        ...(updateProjectDto.priority !== undefined && { priority: updateProjectDto.priority }),
        ...(updateProjectDto.budget !== undefined && { budget: updateProjectDto.budget }),
        ...(updateProjectDto.spent !== undefined && { spent: updateProjectDto.spent }),
        ...(updateProjectDto.progress !== undefined && { progress: updateProjectDto.progress }),
        ...(updateProjectDto.clientName !== undefined && { clientName: updateProjectDto.clientName }),
        ...(updateProjectDto.location !== undefined && { location: updateProjectDto.location }),
      },
      include: {
        category: {
          select: {
            id: true,
            categoryName: true,
            categoryCode: true,
          },
        },
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        managerAssignments: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          take: 1,
          orderBy: {
            assignedDate: 'desc',
          },
        },
        employees: true,
      },
    })

    return this.formatProjectResponse(project)
  }

  async remove(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    })

    if (!project) {
      throw new NotFoundException('Project not found')
    }

    await this.prisma.project.delete({
      where: { id },
    })
  }

  private formatProjectResponse(project: any) {
    // Get manager from active manager assignment (preferred) or fallback to users with PROJECT_MANAGER role
    let projectManager: string | null = null
    if (project.managerAssignments && project.managerAssignments.length > 0) {
      // Get manager from active manager assignment
      projectManager = project.managerAssignments[0]?.user?.name || null
    } else if (project.users) {
      // Fallback to users with PROJECT_MANAGER role
      const managerUser = project.users.find((up: any) => up.user.role === 'PROJECT_MANAGER')
      projectManager = managerUser?.user?.name || null
    }

    return {
      id: project.id,
      projectName: project.name,
      projectCode: project.code,
      description: project.description || '',
      status: project.status,
      startDate: project.startDate ? project.startDate.toISOString().split('T')[0] : null,
      endDate: project.endDate ? project.endDate.toISOString().split('T')[0] : null,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      categoryId: project.categoryId || null,
      category: project.category ? {
        id: project.category.id,
        categoryName: project.category.categoryName,
        categoryCode: project.category.categoryCode,
      } : null,
      priority: project.priority || null,
      budget: project.budget || null,
      spent: project.spent || null,
      progress: project.progress || null,
      clientName: project.clientName || null,
      location: project.location || null,
      projectManager: projectManager,
      teamSize: project.users?.length || 0,
      isActive: project.status === ProjectStatus.ACTIVE,
      users: project.users?.map((up: any) => ({
        id: up.user.id,
        name: up.user.name,
        email: up.user.email,
        role: up.user.role,
      })) || [],
      employees: project.employees || [],
    }
  }
}
