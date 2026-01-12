# HR Management System - Backend API

NestJS backend API for HR Management System with PostgreSQL and Prisma ORM.

## Tech Stack

- **Framework**: NestJS (Node.js + TypeScript)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/hr_management?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

### 3. Set Up PostgreSQL Database

Make sure PostgreSQL is installed and running. Create a database:

```sql
CREATE DATABASE hr_management;
```

### 4. Run Prisma Migrations

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

### 5. Start the Development Server

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/api`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Users

- `GET /api/users/profile` - Get current user profile (Protected)

## Project Structure

```
backend/
├── src/
│   ├── auth/           # Authentication module
│   │   ├── dto/        # Data Transfer Objects
│   │   ├── guards/     # Auth guards
│   │   ├── strategies/ # Passport strategies
│   │   └── decorators/ # Custom decorators
│   ├── users/          # Users module
│   ├── prisma/         # Prisma service
│   └── main.ts         # Application entry point
├── prisma/
│   └── schema.prisma   # Database schema
└── package.json
```

## Database Schema

### User Roles

- `ADMIN` - Full access (Exozen admin)
- `PROJECT_DIRECTOR` - Level 1: View assigned projects
- `PROJECT_HR` - Level 2: HR access within projects
- `PROJECT_MANAGER` - Level 3: Manager access within projects
- `EMPLOYEE` - Level 4: Basic employee access

## Example API Calls

### Register User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "admin@exozen.com",
  "password": "password123",
  "name": "Admin User",
  "role": "ADMIN",
  "department": "IT",
  "designation": "Administrator",
  "company": "Exozen"
}
```

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@exozen.com",
  "password": "password123"
}
```

## Next Steps

1. Add project management endpoints
2. Add employee management endpoints
3. Add role-based access control middleware
4. Add validation and error handling
5. Add API documentation (Swagger)

