# WIP-It-Good
Staff Allocation and Resource Planning for HCAT

A modern TypeScript monorepo application for managing staff allocations across products and initiatives with a spreadsheet-like interface for monthly resource planning.

## Tech Stack

- **Frontend**: React + TypeScript + Vite + ag-grid-react
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Database**: PostgreSQL
- **Validation**: Zod (shared between frontend and backend)

## Features

- 📊 **Staff Management**: Track staff with location, hourly cost, and manager assignments
- 🎯 **Product & Initiative Hierarchy**: Organize work by products and categorized initiatives (Contract/Promise/Expectation/Growth)
- 📅 **6-Month Allocation Grid**: Spreadsheet-like interface for entering monthly percentage allocations
- ⏱️ **Automatic Hours Calculation**: Converts percentages to estimated monthly hours
- ⚠️ **Over-allocation Warnings**: Visual indicators when staff exceeds 100% allocation
- 📥 **CSV Import**: Bulk import staff from spreadsheets
- 🔄 **Real-time Validation**: Zod-based validation on both client and server

## Prerequisites

- Node.js >= 18.0.0
- PostgreSQL database
- npm >= 9.0.0

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install all workspace dependencies
npm install
```

### 2. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and update with your PostgreSQL credentials
# DATABASE_URL="postgresql://username:password@localhost:5432/wip_it_good?schema=public"
```

### 3. Set Up Database

```bash
# Generate Prisma client
npm run db:generate --workspace=apps/server

# Run database migrations
npm run db:migrate

# Seed the database with sample data
npm run db:seed
```

### 4. Run Development Servers

```bash
# Start both frontend and backend concurrently
npm run dev

# Or run individually:
npm run dev:server  # Backend on http://localhost:3001
npm run dev:client  # Frontend on http://localhost:3000
```

## Project Structure

```
WIP-It-Good/
├── apps/
│   ├── client/                 # React frontend
│   │   ├── src/
│   │   │   ├── pages/         # Page components
│   │   │   ├── api/           # API client
│   │   │   └── App.tsx
│   │   └── package.json
│   └── server/                # Node.js backend
│       ├── src/
│       │   ├── routes/        # API routes
│       │   ├── middleware/    # Validation middleware
│       │   └── config/        # Database config
│       ├── prisma/
│       │   ├── schema.prisma  # Database schema
│       │   └── seed.ts        # Seed data
│       └── package.json
└── packages/
    └── shared/                # Shared types and validation
        ├── src/
        │   ├── schemas.ts     # Zod schemas
        │   └── types.ts       # TypeScript types
        └── package.json
```

## Usage

### Managing Entities

1. **Managers**: Create managers first - they're required for staff assignments
2. **Products**: Create products to organize initiatives
3. **Initiatives**: Create initiatives under products with categories (Contract/Promise/Expectation/Growth)
4. **Staff**: Add staff members with location, hourly cost, and manager
5. **Allocations**: Use the grid to enter percentage allocations per month

### Allocation Grid

- **6-month sliding window**: Use prev/next buttons to navigate months
- **Inline editing**: Click any cell to enter a percentage (0-100)
- **Color coding**: Darker blues indicate higher allocations
- **Tooltips**: Hover over cells to see estimated hours
- **Total columns**: Show cumulative allocation per staff per month
  - Green = 100% (fully allocated)
  - Red = >100% (over-allocated)

### CSV Import

Format your CSV with these columns:
- `name`: Staff member name
- `location`: US, UK, Contract, or India
- `hourlyCost`: Decimal number
- `managerName`: Name of existing manager

## Database Schema

- **Manager**: Simple name field
- **Staff**: Name, location (enum), hourly cost, manager reference
- **Product**: Name
- **Initiative**: Name, product reference, category (enum), optional description
- **Allocation**: Staff + initiative + month + year + percentage (unique constraint)

## API Endpoints

- `GET/POST/PUT/DELETE /api/managers`
- `GET/POST/PUT/DELETE /api/staff`
- `POST /api/staff/import` - CSV upload
- `GET/POST/PUT/DELETE /api/products`
- `GET/POST/PUT/DELETE /api/initiatives`
- `GET/POST/PUT/DELETE /api/allocations`
- `POST /api/allocations/batch` - Bulk upsert
- `GET /api/allocations/summary/:staffId/:month/:year` - Allocation summary with hours

## Development Scripts

```bash
npm run dev              # Run both client and server
npm run build            # Build all workspaces
npm run test             # Run all tests (client + server)
npm run test:e2e         # Run end-to-end tests
npm run test:coverage    # Run tests with coverage reports
npm run db:migrate       # Run Prisma migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio
```

## Documentation

- **[Testing Guide](docs/TESTING.md)** - Comprehensive testing documentation including unit, integration, and E2E tests
- **[Security Fix](docs/SECURITY_FIX.md)** - Git history remediation for exposed secrets

## License

Private - Internal HCAT Tool
