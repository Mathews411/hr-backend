import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateBudgetItemDto } from './dto/create-budget-item.dto'
import { UpdateBudgetItemDto } from './dto/update-budget-item.dto'
import { BudgetItemStatus } from '@prisma/client'

@Injectable()
export class BudgetItemsService {
  constructor(private prisma: PrismaService) {}

  async create(createBudgetItemDto: CreateBudgetItemDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: createBudgetItemDto.projectId },
    })

    if (!project) {
      throw new NotFoundException('Project not found')
    }

    const committedAmount = createBudgetItemDto.committedAmount || 0
    const remainingAmount = createBudgetItemDto.budgetedAmount - committedAmount

    const budgetItem = await this.prisma.budgetItem.create({
      data: {
        projectId: createBudgetItemDto.projectId,
        category: createBudgetItemDto.category,
        itemName: createBudgetItemDto.itemName,
        description: createBudgetItemDto.description,
        budgetedAmount: createBudgetItemDto.budgetedAmount,
        actualAmount: createBudgetItemDto.actualAmount || 0,
        committedAmount,
        remainingAmount,
        month: createBudgetItemDto.month,
        status: createBudgetItemDto.status || BudgetItemStatus.PLANNED,
        approvedBy: createBudgetItemDto.approvedBy,
        approvedDate: createBudgetItemDto.approvedDate ? new Date(createBudgetItemDto.approvedDate) : null,
      },
      include: {
        project: true,
      },
    })

    return this.formatBudgetItemResponse(budgetItem)
  }

  async findAll(projectId?: string, status?: string) {
    const where: any = {}
    if (projectId) where.projectId = projectId
    if (status) where.status = status

    const budgetItems = await this.prisma.budgetItem.findMany({
      where,
      include: {
        project: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return budgetItems.map(item => this.formatBudgetItemResponse(item))
  }

  async findOne(id: string) {
    const budgetItem = await this.prisma.budgetItem.findUnique({
      where: { id },
      include: {
        project: true,
      },
    })

    if (!budgetItem) {
      throw new NotFoundException('Budget item not found')
    }

    return this.formatBudgetItemResponse(budgetItem)
  }

  async update(id: string, updateBudgetItemDto: UpdateBudgetItemDto) {
    const budgetItem = await this.prisma.budgetItem.findUnique({
      where: { id },
    })

    if (!budgetItem) {
      throw new NotFoundException('Budget item not found')
    }

    const updateData: any = { ...updateBudgetItemDto }
    
    // Recalculate remaining amount if budgetedAmount or committedAmount changed
    if (updateBudgetItemDto.budgetedAmount !== undefined || updateBudgetItemDto.committedAmount !== undefined) {
      const budgetedAmount = updateBudgetItemDto.budgetedAmount ?? budgetItem.budgetedAmount
      const committedAmount = updateBudgetItemDto.committedAmount ?? budgetItem.committedAmount
      updateData.remainingAmount = budgetedAmount - committedAmount
    }

    if (updateBudgetItemDto.approvedDate) {
      updateData.approvedDate = new Date(updateBudgetItemDto.approvedDate)
    }

    const updated = await this.prisma.budgetItem.update({
      where: { id },
      data: updateData,
      include: {
        project: true,
      },
    })

    return this.formatBudgetItemResponse(updated)
  }

  async remove(id: string) {
    const budgetItem = await this.prisma.budgetItem.findUnique({
      where: { id },
    })

    if (!budgetItem) {
      throw new NotFoundException('Budget item not found')
    }

    await this.prisma.budgetItem.delete({
      where: { id },
    })
  }

  private formatBudgetItemResponse(item: any) {
    return {
      id: item.id,
      projectId: item.projectId,
      projectName: item.project.name,
      projectCode: item.project.code,
      category: item.category,
      itemName: item.itemName,
      description: item.description || '',
      budgetedAmount: item.budgetedAmount,
      actualAmount: item.actualAmount,
      committedAmount: item.committedAmount,
      remainingAmount: item.remainingAmount,
      month: item.month,
      status: item.status === BudgetItemStatus.PLANNED ? 'Planned' :
              item.status === BudgetItemStatus.APPROVED ? 'Approved' :
              item.status === BudgetItemStatus.IN_PROGRESS ? 'In Progress' :
              item.status === BudgetItemStatus.COMPLETED ? 'Completed' : 'Cancelled',
      approvedBy: item.approvedBy,
      approvedDate: item.approvedDate ? item.approvedDate.toISOString().split('T')[0] : null,
      createdDate: item.createdAt.toISOString().split('T')[0],
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }
  }
}
