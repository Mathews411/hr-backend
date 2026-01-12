import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateLeavePolicyDto } from './dto/create-leave-policy.dto'
import { UpdateLeavePolicyDto } from './dto/update-leave-policy.dto'

@Injectable()
export class LeavePoliciesService {
  constructor(private prisma: PrismaService) {}

  async create(createLeavePolicyDto: CreateLeavePolicyDto) {
    // Check if leave code already exists
    const existing = await this.prisma.leavePolicy.findUnique({
      where: { leaveCode: createLeavePolicyDto.leaveCode },
    })

    if (existing) {
      throw new Error('Leave code already exists')
    }

    return this.prisma.leavePolicy.create({
      data: {
        ...createLeavePolicyDto,
        carryForward: createLeavePolicyDto.carryForward ?? false,
        requiresApproval: createLeavePolicyDto.requiresApproval ?? true,
        isActive: createLeavePolicyDto.isActive ?? true,
      },
    })
  }

  async findAll(isActive?: boolean) {
    const where = isActive !== undefined ? { isActive } : {}
    return this.prisma.leavePolicy.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async findOne(id: string) {
    const policy = await this.prisma.leavePolicy.findUnique({
      where: { id },
    })

    if (!policy) {
      throw new NotFoundException('Leave policy not found')
    }

    return policy
  }

  async update(id: string, updateLeavePolicyDto: UpdateLeavePolicyDto) {
    const policy = await this.prisma.leavePolicy.findUnique({
      where: { id },
    })

    if (!policy) {
      throw new NotFoundException('Leave policy not found')
    }

    // Check if leave code is being updated and if it conflicts
    if (updateLeavePolicyDto.leaveCode && updateLeavePolicyDto.leaveCode !== policy.leaveCode) {
      const existing = await this.prisma.leavePolicy.findUnique({
        where: { leaveCode: updateLeavePolicyDto.leaveCode },
      })

      if (existing) {
        throw new Error('Leave code already exists')
      }
    }

    return this.prisma.leavePolicy.update({
      where: { id },
      data: updateLeavePolicyDto,
    })
  }

  async remove(id: string) {
    const policy = await this.prisma.leavePolicy.findUnique({
      where: { id },
    })

    if (!policy) {
      throw new NotFoundException('Leave policy not found')
    }

    return this.prisma.leavePolicy.delete({
      where: { id },
    })
  }

  async toggleActive(id: string) {
    const policy = await this.prisma.leavePolicy.findUnique({
      where: { id },
    })

    if (!policy) {
      throw new NotFoundException('Leave policy not found')
    }

    return this.prisma.leavePolicy.update({
      where: { id },
      data: { isActive: !policy.isActive },
    })
  }
}

