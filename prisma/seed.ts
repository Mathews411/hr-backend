import { PrismaClient, UserRole, ProjectStatus } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample projects
  const project1 = await prisma.project.upsert({
    where: { code: 'PROJ-001' },
    update: {},
    create: {
      name: 'Project Alpha',
      code: 'PROJ-001',
      description: 'Main project for Alpha client',
      status: ProjectStatus.ACTIVE,
    },
  })

  const project2 = await prisma.project.upsert({
    where: { code: 'PROJ-002' },
    update: {},
    create: {
      name: 'Project Beta',
      code: 'PROJ-002',
      description: 'Main project for Beta client',
      status: ProjectStatus.ACTIVE,
    },
  })

  const project3 = await prisma.project.upsert({
    where: { code: 'PROJ-003' },
    update: {},
    create: {
      name: 'Project Gamma',
      code: 'PROJ-003',
      description: 'Main project for Gamma client',
      status: ProjectStatus.ACTIVE,
    },
  })

  console.log('✅ Created projects')

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@exozen.com' },
    update: {},
    create: {
      email: 'admin@exozen.com',
      password: hashedPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
      employeeId: 'EMP-ADMIN-001',
      department: 'IT',
      designation: 'Administrator',
      company: 'Exozen',
    },
  })

  console.log('✅ Created admin user')

  // Create Project Director
  const director = await prisma.user.upsert({
    where: { email: 'director@exozen.com' },
    update: {},
    create: {
      email: 'director@exozen.com',
      password: hashedPassword,
      name: 'Project Director',
      role: UserRole.PROJECT_DIRECTOR,
      employeeId: 'EMP-DIR-001',
      department: 'Management',
      designation: 'Director',
      company: 'Exozen',
      projects: {
        create: [
          { projectId: project1.id },
          { projectId: project2.id },
        ],
      },
    },
  })

  console.log('✅ Created project director')

  // Create Project HR
  const projectHR = await prisma.user.upsert({
    where: { email: 'hr@exozen.com' },
    update: {},
    create: {
      email: 'hr@exozen.com',
      password: hashedPassword,
      name: 'Project HR',
      role: UserRole.PROJECT_HR,
      employeeId: 'EMP-HR-001',
      department: 'HR',
      designation: 'HR Manager',
      company: 'Exozen',
      projects: {
        create: [
          { projectId: project1.id },
        ],
      },
    },
  })

  console.log('✅ Created project HR')

  // Create Project Manager
  const manager = await prisma.user.upsert({
    where: { email: 'manager@exozen.com' },
    update: {},
    create: {
      email: 'manager@exozen.com',
      password: hashedPassword,
      name: 'Project Manager',
      role: UserRole.PROJECT_MANAGER,
      employeeId: 'EMP-MGR-001',
      department: 'Operations',
      designation: 'Project Manager',
      company: 'Exozen',
      projects: {
        create: [
          { projectId: project1.id },
        ],
      },
    },
  })

  console.log('✅ Created project manager')

  // Create Employee
  const employee = await prisma.user.upsert({
    where: { email: 'employee@exozen.com' },
    update: {},
    create: {
      email: 'employee@exozen.com',
      password: hashedPassword,
      name: 'Employee User',
      role: UserRole.EMPLOYEE,
      employeeId: 'EMP-001',
      department: 'Operations',
      designation: 'Employee',
      company: 'Exozen',
      projects: {
        create: [
          { projectId: project1.id },
        ],
      },
    },
  })

  console.log('✅ Created employee user')

  console.log('🎉 Seeding completed!')
  console.log('\n📝 Test Credentials:')
  console.log('Admin: admin@exozen.com / password123')
  console.log('Director: director@exozen.com / password123')
  console.log('HR: hr@exozen.com / password123')
  console.log('Manager: manager@exozen.com / password123')
  console.log('Employee: employee@exozen.com / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

