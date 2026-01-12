import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateProjectCategoryDto } from './dto/create-project-category.dto'
import { UpdateProjectCategoryDto } from './dto/update-project-category.dto'

@Injectable()
export class ProjectCategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectCategoryDto: CreateProjectCategoryDto) {
    // Check if category code already exists
    const existing = await this.prisma.projectCategory.findUnique({
      where: { categoryCode: createProjectCategoryDto.categoryCode },
    })

    if (existing) {
      throw new BadRequestException('Category code already exists')
    }

    return this.prisma.projectCategory.create({
      data: {
        ...createProjectCategoryDto,
        isActive: createProjectCategoryDto.isActive ?? true,
      },
    })
  }

  async findAll(isActive?: boolean) {
    const where = isActive !== undefined ? { isActive } : {}
    const categories = await this.prisma.projectCategory.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate project count for each category
    // Note: This assumes Project model has a categoryId field
    // If not, we'll need to add it or use a different approach
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        // TODO: Count projects by category when Project model has categoryId
        // For now, returning 0 as placeholder
        const projectCount = 0 // await this.prisma.project.count({ where: { categoryId: category.id } })
        return {
          ...category,
          projectCount,
        }
      })
    )

    return categoriesWithCount
  }

  async findOne(id: string) {
    const category = await this.prisma.projectCategory.findUnique({
      where: { id },
    })

    if (!category) {
      throw new NotFoundException('Project category not found')
    }

    // TODO: Calculate project count when Project model has categoryId
    return {
      ...category,
      projectCount: 0,
    }
  }

  async update(id: string, updateProjectCategoryDto: UpdateProjectCategoryDto) {
    const category = await this.prisma.projectCategory.findUnique({
      where: { id },
    })

    if (!category) {
      throw new NotFoundException('Project category not found')
    }

    // Check if category code is being updated and if it conflicts
    if (updateProjectCategoryDto.categoryCode && updateProjectCategoryDto.categoryCode !== category.categoryCode) {
      const existing = await this.prisma.projectCategory.findUnique({
        where: { categoryCode: updateProjectCategoryDto.categoryCode },
      })

      if (existing) {
        throw new BadRequestException('Category code already exists')
      }
    }

    return this.prisma.projectCategory.update({
      where: { id },
      data: updateProjectCategoryDto,
    })
  }

  async remove(id: string) {
    const category = await this.prisma.projectCategory.findUnique({
      where: { id },
    })

    if (!category) {
      throw new NotFoundException('Project category not found')
    }

    // TODO: Check if projects exist for this category before deletion
    // const projectCount = await this.prisma.project.count({ where: { categoryId: id } })
    // if (projectCount > 0) {
    //   throw new BadRequestException(`Cannot delete category. ${projectCount} project(s) are assigned to this category.`)
    // }

    return this.prisma.projectCategory.delete({
      where: { id },
    })
  }

  async toggleActive(id: string) {
    const category = await this.prisma.projectCategory.findUnique({
      where: { id },
    })

    if (!category) {
      throw new NotFoundException('Project category not found')
    }

    return this.prisma.projectCategory.update({
      where: { id },
      data: { isActive: !category.isActive },
    })
  }
}

