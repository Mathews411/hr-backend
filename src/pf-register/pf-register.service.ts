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
export class PfRegisterService {
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
    // Get all active employees
    const employees = await this.prisma.employeeMaster.findMany({
      where: {
        status: 'ACTIVE',
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { employeeCode: { contains: search, mode: 'insensitive' } },
            { uanNumber: { contains: search, mode: 'insensitive' } },
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
      // Calculate PF contributions based on salary template
      const grossWages = this.calculateGrossWages(emp.salaryTemplate)
      const epfWages = Math.min(grossWages, 15000) // EPF wage ceiling
      const epsWages = Math.min(grossWages, 15000) // EPS wage ceiling
      const edliWages = Math.min(grossWages, 15000) // EDLI wage ceiling
      
      // PF contribution rates: Employee 12%, Employer 12% (8.33% to EPS, 3.67% to EPF)
      const employeeContribution = Math.round(epfWages * 0.12)
      const employerEPF = Math.round(epfWages * 0.0367)
      const employerEPS = Math.round(epsWages * 0.0833)
      const employerContribution = employerEPF + employerEPS
      const totalContribution = employeeContribution + employerContribution

      return {
        id: emp.id,
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        employeeCode: emp.employeeCode,
        uanNumber: emp.uanNumber || 'N/A',
        pfNumber: emp.uanNumber ? `PF-${emp.uanNumber.slice(-6)}` : 'N/A',
        wageMonth: month || new Date().toISOString().slice(0, 7),
        grossWages,
        epfWages,
        epsWages,
        edliWages,
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

