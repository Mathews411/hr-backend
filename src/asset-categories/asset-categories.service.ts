import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateAssetCategoryDto } from './dto/create-asset-category.dto'
import { UpdateAssetCategoryDto } from './dto/update-asset-category.dto'

@Injectable()
export class AssetCategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createAssetCategoryDto: CreateAssetCategoryDto) {
    // Check if category code already exists
    const existing = await this.prisma.assetCategory.findUnique({
      where: { categoryCode: createAssetCategoryDto.categoryCode },
    })

    if (existing) {
      throw new BadRequestException('Category code already exists')
    }

    return this.prisma.assetCategory.create({
      data: {
        ...createAssetCategoryDto,
        isActive: createAssetCategoryDto.isActive ?? true,
      },
    })
  }

  async findAll(isActive?: boolean) {
    const where = isActive !== undefined ? { isActive } : {}
    const categories = await this.prisma.assetCategory.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Note: assetCount would need to be calculated from Asset model if it exists
    // For now, returning 0 as placeholder
    return categories.map(category => ({
      ...category,
      assetCount: 0, // TODO: Calculate from Asset model when available
    }))
  }

  async findOne(id: string) {
    const category = await this.prisma.assetCategory.findUnique({
      where: { id },
    })

    if (!category) {
      throw new NotFoundException('Asset category not found')
    }

    return {
      ...category,
      assetCount: 0, // TODO: Calculate from Asset model when available
    }
  }

  async update(id: string, updateAssetCategoryDto: UpdateAssetCategoryDto) {
    const category = await this.prisma.assetCategory.findUnique({
      where: { id },
    })

    if (!category) {
      throw new NotFoundException('Asset category not found')
    }

    // Check if category code is being updated and if it conflicts
    if (updateAssetCategoryDto.categoryCode && updateAssetCategoryDto.categoryCode !== category.categoryCode) {
      const existing = await this.prisma.assetCategory.findUnique({
        where: { categoryCode: updateAssetCategoryDto.categoryCode },
      })

      if (existing) {
        throw new BadRequestException('Category code already exists')
      }
    }

    return this.prisma.assetCategory.update({
      where: { id },
      data: updateAssetCategoryDto,
    })
  }

  async remove(id: string) {
    const category = await this.prisma.assetCategory.findUnique({
      where: { id },
    })

    if (!category) {
      throw new NotFoundException('Asset category not found')
    }

    // TODO: Check if assets exist for this category before deletion
    // For now, allowing deletion
    // if (assetCount > 0) {
    //   throw new BadRequestException(`Cannot delete category. ${assetCount} asset(s) are assigned to this category.`)
    // }

    return this.prisma.assetCategory.delete({
      where: { id },
    })
  }

  async toggleActive(id: string) {
    const category = await this.prisma.assetCategory.findUnique({
      where: { id },
    })

    if (!category) {
      throw new NotFoundException('Asset category not found')
    }

    return this.prisma.assetCategory.update({
      where: { id },
      data: { isActive: !category.isActive },
    })
  }
}

