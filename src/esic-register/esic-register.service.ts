import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

interface SalaryComponent {
  name: string
  type: 'earning' | 'deduction' | 'contribution'
  calculationType: string
  value?: number | string
  isActive?: boolean
}

@Injectable()
export class EsicRegisterService {
  constructor(private prisma: PrismaService) {}

  private calculateGrossWages(salaryTemplate: any): number {
    if (!salaryTemplate || !salaryTemplate.components) {
      return 0
    }

    try {
      const components = salaryTemplate.components as SalaryComponent[]
      let grossWages = 0

      for (const component of components) {
        if (
          component.type === 'earning' &&
          component.isActive !== false &&
          component.calculationType === 'fixed-amount' &&
          typeof component.value === 'number'
        ) {
          grossWages += component.value
        }
      }

      return grossWages
    } catch (error) {
      return 0
    }
  }

  async findAll(status?: string, month?: string, search?: string) {
    // Get all active employees with ESIC numbers
    const employees = await this.prisma.employeeMaster.findMany({
      where: {
        status: 'ACTIVE',
        esicNumber: { not: null },
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { employeeCode: { contains: search, mode: 'insensitive' } },
            { esicNumber: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        department: true,
        designation: true,
        salaryTemplate: true,
      },
    })

    const records = employees.map((emp) => {
      // Calculate ESIC contributions based on salary template
      const grossWages = this.calculateGrossWages(emp.salaryTemplate)
      const esicWages = Math.min(grossWages, 21000) // ESIC wage ceiling
      
      // ESIC contribution rates: Employee 0.75%, Employer 3.25%
      const employeeContribution = Math.round(esicWages * 0.0075)
      const employerContribution = Math.round(esicWages * 0.0325)
      const totalContribution = employeeContribution + employerContribution

      return {
        id: emp.id,
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        employeeCode: emp.employeeCode,
        esicNumber: emp.esicNumber || 'N/A',
        ipNumber: emp.esicNumber ? `IP-${emp.esicNumber.slice(-6)}` : 'N/A',
        wageMonth: month || new Date().toISOString().slice(0, 7),
        grossWages,
        esicWages,
        employeeContribution,
        employerContribution,
        totalContribution,
        status: status || 'Paid',
      }
    })

    // Filter by status if provided
    if (status && status !== 'all') {
      return records.filter((r) => r.status === status)
    }

    return records
  }
}

