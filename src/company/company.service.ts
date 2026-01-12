import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateCompanyDto } from './dto/create-company.dto'
import { UpdateCompanyDto } from './dto/update-company.dto'

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async create(createCompanyDto: CreateCompanyDto) {
    // Check if company already exists (we'll only allow one company for now)
    const existingCompany = await this.prisma.company.findFirst()
    
    if (existingCompany) {
      // Update existing company instead
      return this.update(existingCompany.id, createCompanyDto)
    }

    return this.prisma.company.create({
      data: createCompanyDto,
    })
  }

  async findOne() {
    const company = await this.prisma.company.findFirst({
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!company) {
      throw new NotFoundException('Company profile not found')
    }

    return company
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    })

    if (!company) {
      throw new NotFoundException('Company not found')
    }

    return this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    })
  }

  async updateProfile(updateCompanyDto: UpdateCompanyDto) {
    // Get or create company
    const existingCompany = await this.prisma.company.findFirst()
    
    if (existingCompany) {
      return this.update(existingCompany.id, updateCompanyDto)
    } else {
      return this.create(updateCompanyDto as CreateCompanyDto)
    }
  }
}
