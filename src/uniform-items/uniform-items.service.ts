import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateUniformItemDto } from './dto/create-uniform-item.dto'
import { UpdateUniformItemDto } from './dto/update-uniform-item.dto'

@Injectable()
export class UniformItemsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateUniformItemDto) {
    const item = await this.prisma.uniformItem.create({
      data: {
        itemName: createDto.itemName,
        itemCode: createDto.itemCode,
        category: createDto.category,
        availableSizes: createDto.availableSizes,
        unitCost: createDto.unitCost,
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
        { itemName: { contains: search, mode: 'insensitive' } },
        { itemCode: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (category) {
      where.category = category
    }

    const items = await this.prisma.uniformItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return items.map(item => this.formatResponse(item))
  }

  async findOne(id: string) {
    const item = await this.prisma.uniformItem.findUnique({ where: { id } })
    if (!item) {
      throw new NotFoundException('Uniform item not found')
    }
    return this.formatResponse(item)
  }

  async update(id: string, updateDto: UpdateUniformItemDto) {
    const item = await this.prisma.uniformItem.findUnique({ where: { id } })
    if (!item) {
      throw new NotFoundException('Uniform item not found')
    }

    const totalQuantity = updateDto.totalQuantity ?? item.totalQuantity
    const allocatedQuantity = item.allocatedQuantity
    const availableQuantity = totalQuantity - allocatedQuantity

    const updated = await this.prisma.uniformItem.update({
      where: { id },
      data: {
        itemName: updateDto.itemName,
        category: updateDto.category,
        availableSizes: updateDto.availableSizes,
        unitCost: updateDto.unitCost,
        totalQuantity,
        availableQuantity,
        isActive: updateDto.isActive,
      },
    })

    return this.formatResponse(updated)
  }

  async remove(id: string) {
    const item = await this.prisma.uniformItem.findUnique({ where: { id } })
    if (!item) {
      throw new NotFoundException('Uniform item not found')
    }
    await this.prisma.uniformItem.delete({ where: { id } })
  }

  private formatResponse(item: any) {
    return {
      id: item.id,
      itemName: item.itemName,
      itemCode: item.itemCode,
      category: item.category,
      availableSizes: item.availableSizes,
      unitCost: item.unitCost,
      totalQuantity: item.totalQuantity,
      allocatedQuantity: item.allocatedQuantity,
      availableQuantity: item.availableQuantity,
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }
  }
}

