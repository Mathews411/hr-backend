import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateAssetItemDto } from './dto/create-asset-item.dto'
import { UpdateAssetItemDto } from './dto/update-asset-item.dto'

@Injectable()
export class AssetItemsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateAssetItemDto) {
    const item = await this.prisma.assetItem.create({
      data: {
        assetName: createDto.assetName,
        assetCode: createDto.assetCode,
        category: createDto.category,
        brand: createDto.brand,
        model: createDto.model,
        purchaseDate: createDto.purchaseDate ? new Date(createDto.purchaseDate) : null,
        purchaseCost: createDto.purchaseCost,
        warrantyPeriod: createDto.warrantyPeriod,
        warrantyExpiryDate: createDto.warrantyExpiryDate ? new Date(createDto.warrantyExpiryDate) : null,
        totalQuantity: createDto.totalQuantity,
        allocatedQuantity: 0,
        availableQuantity: createDto.totalQuantity,
        isActive: createDto.isActive !== false,
      },
    })

    return this.formatResponse(item)
  }

  async findAll(search?: string, category?: string) {
    const where: any = {}
    if (search) {
      where.OR = [
        { assetName: { contains: search, mode: 'insensitive' } },
        { assetCode: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (category) {
      where.category = category
    }

    const items = await this.prisma.assetItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return items.map(item => this.formatResponse(item))
  }

  async findOne(id: string) {
    const item = await this.prisma.assetItem.findUnique({ where: { id } })
    if (!item) {
      throw new NotFoundException('Asset item not found')
    }
    return this.formatResponse(item)
  }

  async update(id: string, updateDto: UpdateAssetItemDto) {
    const item = await this.prisma.assetItem.findUnique({ where: { id } })
    if (!item) {
      throw new NotFoundException('Asset item not found')
    }

    const totalQuantity = updateDto.totalQuantity ?? item.totalQuantity
    const allocatedQuantity = item.allocatedQuantity
    const availableQuantity = totalQuantity - allocatedQuantity

    const updated = await this.prisma.assetItem.update({
      where: { id },
      data: {
        assetName: updateDto.assetName,
        category: updateDto.category,
        brand: updateDto.brand,
        model: updateDto.model,
        purchaseDate: updateDto.purchaseDate ? new Date(updateDto.purchaseDate) : undefined,
        purchaseCost: updateDto.purchaseCost,
        warrantyPeriod: updateDto.warrantyPeriod,
        warrantyExpiryDate: updateDto.warrantyExpiryDate ? new Date(updateDto.warrantyExpiryDate) : undefined,
        totalQuantity,
        availableQuantity,
        isActive: updateDto.isActive,
      },
    })

    return this.formatResponse(updated)
  }

  async remove(id: string) {
    const item = await this.prisma.assetItem.findUnique({ where: { id } })
    if (!item) {
      throw new NotFoundException('Asset item not found')
    }
    await this.prisma.assetItem.delete({ where: { id } })
  }

  private formatResponse(item: any) {
    return {
      id: item.id,
      assetName: item.assetName,
      assetCode: item.assetCode,
      category: item.category,
      brand: item.brand,
      model: item.model,
      purchaseDate: item.purchaseDate ? item.purchaseDate.toISOString().split('T')[0] : null,
      purchaseCost: item.purchaseCost,
      warrantyPeriod: item.warrantyPeriod,
      warrantyExpiryDate: item.warrantyExpiryDate ? item.warrantyExpiryDate.toISOString().split('T')[0] : null,
      totalQuantity: item.totalQuantity,
      allocatedQuantity: item.allocatedQuantity,
      availableQuantity: item.availableQuantity,
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }
  }
}

