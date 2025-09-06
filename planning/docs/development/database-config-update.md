# Database Configuration Update
## Using Existing PostgreSQL Database

### Current Database Information
- **Host**: localhost
- **Port**: 5432
- **Username**: postgres
- **Password**: postgres
- **Database**: tucson

---

## 1. Backend Environment Configuration

### 1.1 Update Backend .env File

```bash
# Navigate to backend directory
cd ~/source/repos/Tucson/backend

# Create/Update .env file with correct database credentials
cat > .env << 'EOF'
# Database - Using existing PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tucson"

# Clerk Authentication
CLERK_SECRET_KEY="sk_test_YOUR_SECRET_KEY"
CLERK_PUBLISHABLE_KEY="pk_test_YOUR_PUBLISHABLE_KEY"
CLERK_WEBHOOK_SECRET="whsec_YOUR_WEBHOOK_SECRET"

# Server
PORT=3001
NODE_ENV=development

# Redis (if you have Redis installed)
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="7d"

# AWS S3 (optional - for image storage)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your_access_key"
AWS_SECRET_ACCESS_KEY="your_secret_key"
AWS_BUCKET_NAME="tucson-realestate-assets"

# Email (optional - SendGrid)
SENDGRID_API_KEY="your_sendgrid_key"
EMAIL_FROM="noreply@tucson-invest.com"

# External APIs (optional)
MATTERPORT_API_KEY="your_matterport_key"
MAPBOX_ACCESS_TOKEN="your_mapbox_token"
STRIPE_SECRET_KEY="sk_test_your_stripe_key"

# Logging
LOG_LEVEL="debug"
EOF
```

---

## 2. Prisma Configuration Update

### 2.1 Update Prisma Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Your schema models remain the same...
```

### 2.2 Test Database Connection

```bash
# Test the connection
cd ~/source/repos/Tucson/backend

# Install dependencies if not already done
pnpm install

# Generate Prisma Client
npx prisma generate

# Test database connection
npx prisma db pull

# This should connect successfully and show existing tables (if any)
```

---

## 3. Initialize Database Schema

### 3.1 Create Initial Migration

```bash
# If starting fresh, create initial migration
npx prisma migrate dev --name initial_schema

# If you have existing data you want to keep, use:
npx prisma db push
```

### 3.2 Seed Initial Data (Optional)

Create a seed file to populate initial data:

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample properties
  const properties = [
    {
      name: 'Sunset Ridge Apartments',
      slug: 'sunset-ridge-apartments',
      addressLine1: '123 Sunset Blvd',
      city: 'Tucson',
      state: 'AZ',
      zipCode: '85701',
      propertyType: 'multi_family',
      propertyClass: 'B',
      yearBuilt: 2010,
      totalUnits: 120,
      totalSqft: 96000,
      purchasePrice: 15000000,
      askingPrice: 15000000,
      minimumInvestment: 50000,
      targetRaise: 5000000,
      currentNOI: 1200000,
      projectedNOI: 1440000,
      capRate: 8.0,
      targetIRR: 18.5,
      cashOnCash: 9.2,
      occupancyRate: 94.5,
      averageRent: 1250,
      status: 'active',
      investmentStatus: 'open',
      description: 'Premier multi-family property in the heart of Tucson with strong rental demand and value-add opportunities.',
      amenities: {
        pool: true,
        gym: true,
        parking: true,
        laundry: true,
        petFriendly: true,
      },
    },
    {
      name: 'Desert Oasis Commons',
      slug: 'desert-oasis-commons',
      addressLine1: '456 Cactus Way',
      city: 'Tucson',
      state: 'AZ',
      zipCode: '85704',
      propertyType: 'apartment_complex',
      propertyClass: 'A',
      yearBuilt: 2018,
      totalUnits: 200,
      totalSqft: 180000,
      purchasePrice: 28000000,
      askingPrice: 28000000,
      minimumInvestment: 100000,
      targetRaise: 8000000,
      currentNOI: 2100000,
      projectedNOI: 2400000,
      capRate: 7.5,
      targetIRR: 20.0,
      cashOnCash: 8.5,
      occupancyRate: 96.0,
      averageRent: 1450,
      status: 'active',
      investmentStatus: 'open',
      description: 'Luxury apartment complex with modern amenities and strong appreciation potential.',
      amenities: {
        pool: true,
        gym: true,
        clubhouse: true,
        businessCenter: true,
        coveredParking: true,
        petPark: true,
      },
    },
    {
      name: 'Mountain View Residences',
      slug: 'mountain-view-residences',
      addressLine1: '789 Catalina Foothills Dr',
      city: 'Tucson',
      state: 'AZ',
      zipCode: '85718',
      propertyType: 'multi_family',
      propertyClass: 'B',
      yearBuilt: 2005,
      totalUnits: 84,
      totalSqft: 75600,
      purchasePrice: 12000000,
      askingPrice: 12000000,
      minimumInvestment: 25000,
      targetRaise: 4000000,
      currentNOI: 960000,
      projectedNOI: 1152000,
      capRate: 8.0,
      targetIRR: 19.0,
      cashOnCash: 9.8,
      occupancyRate: 92.0,
      averageRent: 1150,
      status: 'renovating',
      investmentStatus: 'open',
      description: 'Value-add opportunity with ongoing renovations to modernize units and increase rents.',
      amenities: {
        pool: true,
        parking: true,
        laundry: true,
        gatedAccess: true,
      },
    },
  ]

  for (const property of properties) {
    await prisma.property.create({
      data: property,
    })
  }

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Add seed script to package.json:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

Run the seed:

```bash
npx prisma db seed
```

---

## 4. Database Management Commands

### 4.1 Useful PostgreSQL Commands

```bash
# Connect to PostgreSQL
psql -U postgres -d tucson -h localhost

# Once connected, useful commands:
\dt                    # List all tables
\d+ table_name        # Describe table structure
\l                    # List all databases
\du                   # List all users
\q                    # Quit

# From terminal - backup database
pg_dump -U postgres -d tucson > tucson_backup.sql

# Restore database
psql -U postgres -d tucson < tucson_backup.sql
```

### 4.2 Prisma Commands

```bash
# View database in Prisma Studio (GUI)
npx prisma studio

# Generate Prisma Client after schema changes
npx prisma generate

# Create migration
npx prisma migrate dev --name description_of_changes

# Apply migrations in production
npx prisma migrate deploy

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Pull schema from existing database
npx prisma db pull

# Push schema to database without migration (development only)
npx prisma db push
```

---

## 5. Database Connection Testing

### 5.1 Create Test Script

```typescript
// test-db-connection.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function testConnection() {
  try {
    // Test connection
    await prisma.$connect()
    console.log('✅ Successfully connected to PostgreSQL database')
    
    // Test query
    const propertyCount = await prisma.property.count()
    console.log(`📊 Found ${propertyCount} properties in database`)
    
    // Get database version
    const result = await prisma.$queryRaw`SELECT version()`
    console.log('🗄️ Database version:', result)
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
```

Run the test:

```bash
npx ts-node test-db-connection.ts
```

---

## 6. Update Docker Compose (Optional)

If you want to use Docker Compose with your existing database:

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Comment out postgres if using existing database
  # postgres:
  #   image: postgis/postgis:14-3.2
  #   environment:
  #     POSTGRES_USER: postgres
  #     POSTGRES_PASSWORD: postgres
  #     POSTGRES_DB: tucson
  #   ports:
  #     - "5432:5432"
  #   volumes:
  #     - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@host.docker.internal:5432/tucson
      REDIS_URL: redis://redis:6379
    depends_on:
      - redis
    volumes:
      - ./backend:/app
      - /app/node_modules
    extra_hosts:
      - "host.docker.internal:host-gateway"  # Allows Docker to connect to host PostgreSQL

  web:
    build: ./web
    ports:
      - "5173:5173"
    volumes:
      - ./web:/app
      - /app/node_modules
    environment:
      VITE_API_URL: http://localhost:3001

volumes:
  postgres_data:
```

---

## 7. Troubleshooting

### 7.1 Common Connection Issues

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check PostgreSQL logs
sudo journalctl -u postgresql -n 50

# Test connection with psql
PGPASSWORD=postgres psql -U postgres -d tucson -h localhost -c "SELECT NOW();"

# Check port availability
sudo netstat -plnt | grep 5432

# Check PostgreSQL configuration
sudo nano /etc/postgresql/*/main/postgresql.conf
# Ensure: listen_addresses = 'localhost' or '*'

# Check authentication configuration
sudo nano /etc/postgresql/*/main/pg_hba.conf
# Ensure you have: local all postgres md5
```

### 7.2 Permission Issues

```bash
# Grant all privileges to postgres user on tucson database
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE tucson TO postgres;"

# Create database if it doesn't exist
sudo -u postgres createdb tucson

# Change database owner
sudo -u postgres psql -c "ALTER DATABASE tucson OWNER TO postgres;"
```

---

## 8. Quick Start Commands

```bash
# 1. Clone and setup backend
cd ~/source/repos/Tucson
mkdir backend && cd backend
pnpm init -y
pnpm add express prisma @prisma/client dotenv
pnpm add -D typescript @types/node @types/express ts-node-dev

# 2. Initialize Prisma with existing database
npx prisma init
# Update DATABASE_URL in .env as shown above

# 3. Pull existing schema (if any) or push new schema
npx prisma db pull  # Get existing schema
# OR
npx prisma db push  # Push new schema

# 4. Generate Prisma Client
npx prisma generate

# 5. Start Prisma Studio to view/edit data
npx prisma studio

# 6. Run development server
pnpm dev
```

---

## 9. VS Code Database Extensions

Install these VS Code extensions for better database management:

```bash
code --install-extension ckolkman.vscode-postgres
code --install-extension Prisma.prisma
code --install-extension mtxr.sqltools
code --install-extension mtxr.sqltools-driver-pg
```

Configure PostgreSQL extension:
1. Press `Ctrl+Shift+P`
2. Type "PostgreSQL: New Connection"
3. Enter:
   - Host: localhost
   - User: postgres
   - Password: postgres
   - Port: 5432
   - Database: tucson

---

Your existing PostgreSQL database is now properly configured for the Tucson real estate investment platform! The connection string `postgresql://postgres:postgres@localhost:5432/tucson` is set up in all the necessary configuration files.