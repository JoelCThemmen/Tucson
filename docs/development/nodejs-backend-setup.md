# Node.js Backend Setup with Clerk Authentication
## Real Estate Investment Platform

### Version 1.0
### Date: September 2025

---

## 1. Project Initialization

### 1.1 Create Backend Project

```bash
# Navigate to Tucson directory
cd ~/source/repos/Tucson

# Create backend directory
mkdir backend && cd backend

# Initialize package.json
pnpm init

# Create TypeScript configuration
npx tsc --init
```

### 1.2 Install Core Dependencies

```bash
# Core packages
pnpm add \
  express \
  cors \
  helmet \
  compression \
  dotenv \
  express-rate-limit \
  express-validator

# Clerk authentication
pnpm add \
  @clerk/clerk-sdk-node \
  @clerk/backend

# Database and ORM
pnpm add \
  @prisma/client \
  prisma \
  pg

# Utilities
pnpm add \
  zod \
  winston \
  morgan \
  multer \
  sharp \
  axios \
  date-fns \
  uuid \
  bcryptjs \
  jsonwebtoken

# Job queue and caching
pnpm add \
  bull \
  ioredis \
  node-cron

# AWS SDK for S3
pnpm add \
  @aws-sdk/client-s3 \
  @aws-sdk/s3-request-presigner

# Development dependencies
pnpm add -D \
  @types/node \
  @types/express \
  @types/cors \
  @types/compression \
  @types/morgan \
  @types/multer \
  @types/bcryptjs \
  @types/jsonwebtoken \
  @types/uuid \
  typescript \
  ts-node \
  ts-node-dev \
  nodemon \
  eslint \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  prettier \
  jest \
  @types/jest \
  supertest \
  @types/supertest
```

---

## 2. Project Structure

### 2.1 Create Directory Structure

```bash
# Create comprehensive folder structure
mkdir -p src/{config,controllers,middleware,routes,services,utils,types,jobs,validators}
mkdir -p src/controllers/{auth,properties,investments,users,documents}
mkdir -p src/services/{email,storage,payment,analytics}
mkdir -p prisma/{migrations,seeds}
mkdir -p uploads/temp
mkdir -p logs
```

### 2.2 Folder Organization

```
backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── migrations/        # Database migrations
│   └── seed.ts           # Seed data
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript types
│   ├── jobs/            # Background jobs
│   ├── validators/      # Request validation
│   └── index.ts         # Entry point
├── uploads/             # Temporary file uploads
├── logs/               # Application logs
└── tests/              # Test files
```

---

## 3. TypeScript Configuration

### 3.1 Update tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "node",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@config/*": ["src/config/*"],
      "@controllers/*": ["src/controllers/*"],
      "@middleware/*": ["src/middleware/*"],
      "@routes/*": ["src/routes/*"],
      "@services/*": ["src/services/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    },
    "typeRoots": ["./node_modules/@types", "./src/types"],
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

---

## 4. Prisma Database Setup

### 4.1 Initialize Prisma

```bash
npx prisma init
```

### 4.2 Define Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User model integrated with Clerk
model User {
  id                String    @id @default(uuid())
  clerkId           String    @unique
  email             String    @unique
  firstName         String?
  lastName          String?
  avatarUrl         String?
  
  // Investor information
  isAccredited      Boolean   @default(false)
  accreditedDate    DateTime?
  verificationStatus String   @default("pending") // pending, verified, rejected
  investmentRange   Json?     // {min: 50000, max: 500000}
  
  // Preferences
  preferences       Json?
  notificationSettings Json?
  
  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  lastLoginAt       DateTime?
  
  // Relations
  investments       Investment[]
  documents         Document[]
  favorites         PropertyFavorite[]
  viewHistory       PropertyView[]
  
  @@index([clerkId])
  @@index([email])
}

model Property {
  id                String    @id @default(uuid())
  name              String
  slug              String    @unique
  
  // Address
  addressLine1      String
  addressLine2      String?
  city              String
  state             String
  zipCode           String
  latitude          Float?
  longitude         Float?
  
  // Property details
  propertyType      String    // multi_family, apartment_complex
  propertyClass     String    // A, B, C
  yearBuilt         Int
  totalUnits        Int
  totalSqft         Int?
  lotSizeAcres      Float?
  parkingSpaces     Int?
  
  // Financial metrics
  purchasePrice     Float
  purchaseDate      DateTime?
  currentValuation  Float?
  askingPrice       Float
  minimumInvestment Float
  targetRaise       Float
  amountRaised      Float     @default(0)
  
  // Performance metrics
  currentNOI        Float
  projectedNOI      Float?
  capRate           Float
  targetIRR         Float
  cashOnCash        Float?
  occupancyRate     Float
  averageRent       Float?
  
  // Status
  status            String    @default("active") // active, renovating, sold
  investmentStatus  String    @default("open") // open, closed, funded
  featured          Boolean   @default(false)
  
  // Content
  description       String?   @db.Text
  executiveSummary  String?   @db.Text
  investmentThesis  String?   @db.Text
  amenities         Json?
  highlights        Json?
  
  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  publishedAt       DateTime?
  
  // Relations
  investments       Investment[]
  photos            PropertyPhoto[]
  documents         PropertyDocument[]
  virtualTours      VirtualTour[]
  financials        PropertyFinancial[]
  renovations       Renovation[]
  units             Unit[]
  favorites         PropertyFavorite[]
  views             PropertyView[]
  
  @@index([slug])
  @@index([status])
  @@index([city, state])
}

model Investment {
  id                String    @id @default(uuid())
  
  // Relations
  userId            String
  user              User      @relation(fields: [userId], references: [id])
  propertyId        String
  property          Property  @relation(fields: [propertyId], references: [id])
  
  // Investment details
  amount            Float
  shares            Float?
  ownershipPercent  Float?
  
  // Status
  status            String    @default("pending") // pending, committed, funded, exited
  
  // Dates
  commitmentDate    DateTime?
  fundingDate       DateTime?
  exitDate          DateTime?
  
  // Payment
  paymentMethod     String?   // wire, ach, check
  paymentReference  String?
  
  // Returns
  totalDistributions Float    @default(0)
  totalReturns      Float     @default(0)
  
  // Documents
  documents         Json?
  
  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  distributions     Distribution[]
  
  @@unique([userId, propertyId])
  @@index([userId])
  @@index([propertyId])
  @@index([status])
}

model PropertyPhoto {
  id                String    @id @default(uuid())
  propertyId        String
  property          Property  @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  
  url               String
  thumbnailUrl      String?
  category          String    // exterior, interior, amenity, unit, aerial, renovation
  caption           String?
  order             Int       @default(0)
  isHero            Boolean   @default(false)
  
  width             Int?
  height            Int?
  size              Int?
  
  createdAt         DateTime  @default(now())
  
  @@index([propertyId])
  @@index([category])
}

model VirtualTour {
  id                String    @id @default(uuid())
  propertyId        String
  property          Property  @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  
  type              String    // matterport, 360_photos, video
  url               String
  embedCode         String?   @db.Text
  thumbnailUrl      String?
  
  // Matterport specific
  matterportId      String?
  
  // Features
  hasDollhouse      Boolean   @default(false)
  hasFloorplan      Boolean   @default(false)
  hasMeasurements   Boolean   @default(false)
  
  // Analytics
  viewCount         Int       @default(0)
  avgViewDuration   Int?      // in seconds
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([propertyId])
}

model PropertyFinancial {
  id                String    @id @default(uuid())
  propertyId        String
  property          Property  @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  
  periodStart       DateTime
  periodEnd         DateTime
  periodType        String    // monthly, quarterly, annual
  
  // Income
  grossRentalIncome Float
  otherIncome       Float     @default(0)
  totalIncome       Float
  
  // Expenses
  operatingExpenses Float
  managementFees    Float     @default(0)
  maintenanceCosts  Float     @default(0)
  propertyTaxes     Float     @default(0)
  insurance         Float     @default(0)
  utilities         Float     @default(0)
  totalExpenses     Float
  
  // Metrics
  noi               Float
  occupancyRate     Float
  
  createdAt         DateTime  @default(now())
  
  @@unique([propertyId, periodStart, periodEnd])
  @@index([propertyId])
  @@index([periodStart, periodEnd])
}

model Renovation {
  id                String    @id @default(uuid())
  propertyId        String
  property          Property  @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  
  name              String
  description       String?   @db.Text
  
  status            String    @default("planned") // planned, in_progress, completed
  
  budgetedCost      Float
  actualCost        Float?
  
  startDate         DateTime?
  endDate           DateTime?
  completionPercent Int       @default(0)
  
  beforePhotos      Json?
  afterPhotos       Json?
  progressUpdates   Json?
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([propertyId])
  @@index([status])
}

model Unit {
  id                String    @id @default(uuid())
  propertyId        String
  property          Property  @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  
  unitNumber        String
  unitType          String    // studio, 1br, 2br, 3br
  bedrooms          Int
  bathrooms         Float
  sqft              Int
  
  currentRent       Float
  marketRent        Float?
  
  status            String    @default("vacant") // occupied, vacant, renovation
  
  features          Json?
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@unique([propertyId, unitNumber])
  @@index([propertyId])
  @@index([status])
}

model Distribution {
  id                String    @id @default(uuid())
  investmentId      String
  investment        Investment @relation(fields: [investmentId], references: [id])
  
  amount            Float
  type              String    // income, return_of_capital, appreciation
  
  paymentDate       DateTime
  paymentMethod     String?
  paymentReference  String?
  
  status            String    @default("pending") // pending, processing, completed
  
  createdAt         DateTime  @default(now())
  
  @@index([investmentId])
  @@index([paymentDate])
}

model Document {
  id                String    @id @default(uuid())
  userId            String?
  user              User?     @relation(fields: [userId], references: [id])
  
  name              String
  type              String    // ppm, agreement, financial, tax
  url               String
  size              Int
  mimeType          String
  
  uploadedAt        DateTime  @default(now())
  
  @@index([userId])
}

model PropertyDocument {
  id                String    @id @default(uuid())
  propertyId        String
  property          Property  @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  
  name              String
  type              String    // ppm, financial, inspection, insurance
  url               String
  size              Int
  
  isPublic          Boolean   @default(false)
  
  uploadedAt        DateTime  @default(now())
  
  @@index([propertyId])
}

model PropertyFavorite {
  id                String    @id @default(uuid())
  userId            String
  user              User      @relation(fields: [userId], references: [id])
  propertyId        String
  property          Property  @relation(fields: [propertyId], references: [id])
  
  createdAt         DateTime  @default(now())
  
  @@unique([userId, propertyId])
  @@index([userId])
  @@index([propertyId])
}

model PropertyView {
  id                String    @id @default(uuid())
  userId            String?
  user              User?     @relation(fields: [userId], references: [id])
  propertyId        String
  property          Property  @relation(fields: [propertyId], references: [id])
  
  viewedAt          DateTime  @default(now())
  duration          Int?      // in seconds
  source            String?   // direct, email, social
  
  @@index([userId])
  @@index([propertyId])
  @@index([viewedAt])
}
```

### 4.3 Run Migrations

```bash
# Create migration
npx prisma migrate dev --name initial_schema

# Generate Prisma Client
npx prisma generate

# Seed database (optional)
npx prisma db seed
```

---

## 5. Clerk Authentication Setup

### 5.1 Environment Configuration

```bash
# Create .env file
cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://realestate_dev:dev_password_123@localhost:5432/realestate_dev"

# Clerk
CLERK_SECRET_KEY="sk_test_YOUR_SECRET_KEY"
CLERK_PUBLISHABLE_KEY="pk_test_YOUR_PUBLISHABLE_KEY"
CLERK_WEBHOOK_SECRET="whsec_YOUR_WEBHOOK_SECRET"

# Server
PORT=3001
NODE_ENV=development

# Redis
REDIS_URL="redis://localhost:6379"

# AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your_access_key"
AWS_SECRET_ACCESS_KEY="your_secret_key"
AWS_BUCKET_NAME="realestate-assets"

# JWT (for additional auth if needed)
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Email
SENDGRID_API_KEY="your_sendgrid_key"
EMAIL_FROM="noreply@realestateinvest.com"

# External APIs
MATTERPORT_API_KEY="your_matterport_key"
MAPBOX_ACCESS_TOKEN="your_mapbox_token"
STRIPE_SECRET_KEY="sk_test_your_stripe_key"

# Logging
LOG_LEVEL="debug"
EOF
```

### 5.2 Clerk Middleware

```typescript
// src/middleware/auth.ts
import { ClerkExpressRequireAuth, RequireAuthProp } from '@clerk/clerk-sdk-node'
import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      auth?: RequireAuthProp
      user?: any
    }
  }
}

// Clerk authentication middleware
export const requireAuth = ClerkExpressRequireAuth({})

// Custom middleware to load user from database
export const loadUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.auth?.userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: req.auth.userId }
    })

    if (!user) {
      // Create user if doesn't exist
      const clerkUser = await clerk.users.getUser(req.auth.userId)
      const newUser = await prisma.user.create({
        data: {
          clerkId: req.auth.userId,
          email: clerkUser.emailAddresses[0].emailAddress,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          avatarUrl: clerkUser.profileImageUrl,
        }
      })
      req.user = newUser
    } else {
      req.user = user
    }

    next()
  } catch (error) {
    console.error('Error loading user:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Check if user is accredited investor
export const requireAccredited = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.isAccredited) {
    return res.status(403).json({ 
      error: 'Accredited investor status required' 
    })
  }
  next()
}

// Role-based access control
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    next()
  }
}
```

---

## 6. Express Server Setup

### 6.1 Main Server File

```typescript
// src/index.ts
import 'dotenv/config'
import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import { rateLimit } from 'express-rate-limit'
import { PrismaClient } from '@prisma/client'
import { createBullBoard } from '@bull-board/express'
import { BullAdapter } from '@bull-board/api/bullAdapter'
import { Queue } from 'bull'

// Import routes
import authRoutes from './routes/auth.routes'
import propertyRoutes from './routes/property.routes'
import investmentRoutes from './routes/investment.routes'
import userRoutes from './routes/user.routes'
import documentRoutes from './routes/document.routes'
import webhookRoutes from './routes/webhook.routes'

// Import middleware
import { errorHandler } from './middleware/errorHandler'
import { logger } from './utils/logger'

// Initialize Prisma
const prisma = new PrismaClient()

// Initialize Express app
const app: Express = express()
const PORT = process.env.PORT || 3001

// Setup Bull Queue dashboard
const emailQueue = new Queue('email', process.env.REDIS_URL!)
const imageQueue = new Queue('image-processing', process.env.REDIS_URL!)

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [new BullAdapter(emailQueue), new BullAdapter(imageQueue)],
})

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}))

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}))

app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
})

app.use('/api', limiter)

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// Bull Board UI
app.use('/admin/queues', addQueue)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/properties', propertyRoutes)
app.use('/api/investments', investmentRoutes)
app.use('/api/users', userRoutes)
app.use('/api/documents', documentRoutes)
app.use('/webhooks', webhookRoutes)

// Static files for uploads
app.use('/uploads', express.static('uploads'))

// Error handling
app.use(errorHandler)

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' })
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server')
  await prisma.$disconnect()
  process.exit(0)
})

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`)
  logger.info(`📊 Bull Dashboard: http://localhost:${PORT}/admin/queues`)
  logger.info(`🔥 Environment: ${process.env.NODE_ENV}`)
})

export default app
```

---

## 7. API Routes

### 7.1 Property Routes

```typescript
// src/routes/property.routes.ts
import { Router } from 'express'
import { requireAuth, loadUser } from '../middleware/auth'
import * as propertyController from '../controllers/property.controller'
import { validateRequest } from '../middleware/validation'
import { propertyValidation } from '../validators/property.validator'

const router = Router()

// Public routes
router.get('/', propertyController.getProperties)
router.get('/:id', propertyController.getPropertyById)
router.get('/:id/photos', propertyController.getPropertyPhotos)
router.get('/:id/virtual-tour', propertyController.getVirtualTour)
router.get('/:id/financials', propertyController.getPropertyFinancials)

// Protected routes
router.use(requireAuth, loadUser)

router.post(
  '/:id/favorite',
  propertyController.toggleFavorite
)

router.post(
  '/:id/invest',
  validateRequest(propertyValidation.invest),
  propertyController.createInvestment
)

router.get(
  '/:id/documents',
  propertyController.getPropertyDocuments
)

// Admin routes
router.post(
  '/',
  requireRole(['admin']),
  validateRequest(propertyValidation.create),
  propertyController.createProperty
)

router.put(
  '/:id',
  requireRole(['admin']),
  validateRequest(propertyValidation.update),
  propertyController.updateProperty
)

router.delete(
  '/:id',
  requireRole(['admin']),
  propertyController.deleteProperty
)

export default router
```

### 7.2 Property Controller

```typescript
// src/controllers/property.controller.ts
import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { propertyService } from '../services/property.service'
import { cacheService } from '../services/cache.service'
import { logger } from '../utils/logger'

const prisma = new PrismaClient()

export const getProperties = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 12,
      status = 'active',
      propertyType,
      city,
      state,
      minInvestment,
      maxInvestment,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query

    // Try to get from cache
    const cacheKey = `properties:${JSON.stringify(req.query)}`
    const cached = await cacheService.get(cacheKey)
    
    if (cached) {
      return res.json(cached)
    }

    // Build where clause
    const where: any = { status }
    
    if (propertyType) where.propertyType = propertyType
    if (city) where.city = city
    if (state) where.state = state
    if (minInvestment || maxInvestment) {
      where.minimumInvestment = {}
      if (minInvestment) where.minimumInvestment.gte = Number(minInvestment)
      if (maxInvestment) where.minimumInvestment.lte = Number(maxInvestment)
    }

    // Get properties with pagination
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          photos: {
            where: { isHero: true },
            take: 1,
          },
          virtualTours: {
            take: 1,
          },
          _count: {
            select: {
              investments: true,
              favorites: true,
            },
          },
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { [sortBy as string]: order },
      }),
      prisma.property.count({ where }),
    ])

    const response = {
      data: properties,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    }

    // Cache for 5 minutes
    await cacheService.set(cacheKey, response, 300)

    res.json(response)
  } catch (error) {
    logger.error('Error fetching properties:', error)
    res.status(500).json({ error: 'Failed to fetch properties' })
  }
}

export const getPropertyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        photos: {
          orderBy: { order: 'asc' },
        },
        virtualTours: true,
        documents: {
          where: { isPublic: true },
        },
        financials: {
          orderBy: { periodStart: 'desc' },
          take: 12,
        },
        renovations: {
          orderBy: { createdAt: 'desc' },
        },
        units: {
          orderBy: { unitNumber: 'asc' },
        },
        _count: {
          select: {
            investments: true,
            favorites: true,
          },
        },
      },
    })

    if (!property) {
      return res.status(404).json({ error: 'Property not found' })
    }

    // Track view
    if (req.user) {
      await prisma.propertyView.create({
        data: {
          propertyId: id,
          userId: req.user.id,
          source: req.headers.referer ? 'referral' : 'direct',
        },
      })
    }

    res.json(property)
  } catch (error) {
    logger.error('Error fetching property:', error)
    res.status(500).json({ error: 'Failed to fetch property' })
  }
}

export const createInvestment = async (req: Request, res: Response) => {
  try {
    const { id: propertyId } = req.params
    const { amount } = req.body
    const userId = req.user.id

    // Check if user is accredited
    if (!req.user.isAccredited) {
      return res.status(403).json({ 
        error: 'Accredited investor status required' 
      })
    }

    // Check property availability
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    })

    if (!property || property.investmentStatus !== 'open') {
      return res.status(400).json({ 
        error: 'Property not available for investment' 
      })
    }

    if (amount < property.minimumInvestment) {
      return res.status(400).json({ 
        error: `Minimum investment is ${property.minimumInvestment}` 
      })
    }

    // Create investment
    const investment = await prisma.investment.create({
      data: {
        userId,
        propertyId,
        amount,
        status: 'pending',
        ownershipPercent: (amount / property.targetRaise) * 100,
      },
    })

    // Send confirmation email
    await emailQueue.add('investment-confirmation', {
      userId,
      investmentId: investment.id,
      propertyName: property.name,
      amount,
    })

    res.status(201).json(investment)
  } catch (error) {
    logger.error('Error creating investment:', error)
    res.status(500).json({ error: 'Failed to create investment' })
  }
}
```

---

## 8. Services Layer

### 8.1 Cache Service (Redis)

```typescript
// src/services/cache.service.ts
import Redis from 'ioredis'
import { logger } from '../utils/logger'

class CacheService {
  private redis: Redis

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!)
    
    this.redis.on('error', (error) => {
      logger.error('Redis error:', error)
    })
    
    this.redis.on('connect', () => {
      logger.info('Redis connected')
    })
  }

  async get(key: string): Promise<any> {
    try {
      const data = await this.redis.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      logger.error('Cache get error:', error)
      return null
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const data = JSON.stringify(value)
      if (ttl) {
        await this.redis.setex(key, ttl, data)
      } else {
        await this.redis.set(key, data)
      }
    } catch (error) {
      logger.error('Cache set error:', error)
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key)
    } catch (error) {
      logger.error('Cache delete error:', error)
    }
  }

  async flush(): Promise<void> {
    try {
      await this.redis.flushall()
    } catch (error) {
      logger.error('Cache flush error:', error)
    }
  }
}

export const cacheService = new CacheService()
```

### 8.2 S3 Storage Service

```typescript
// src/services/storage.service.ts
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'
import { logger } from '../utils/logger'

class StorageService {
  private s3: S3Client
  private bucketName: string

  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
    this.bucketName = process.env.AWS_BUCKET_NAME!
  }

  async uploadPropertyPhoto(
    file: Buffer,
    propertyId: string,
    category: string
  ): Promise<{ url: string; thumbnailUrl: string }> {
    try {
      const fileId = uuidv4()
      const key = `properties/${propertyId}/${category}/${fileId}.jpg`
      const thumbnailKey = `properties/${propertyId}/${category}/${fileId}_thumb.jpg`

      // Process main image
      const processedImage = await sharp(file)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer()

      // Create thumbnail
      const thumbnail = await sharp(file)
        .resize(400, 300, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toBuffer()

      // Upload main image
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: processedImage,
          ContentType: 'image/jpeg',
        })
      )

      // Upload thumbnail
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: thumbnailKey,
          Body: thumbnail,
          ContentType: 'image/jpeg',
        })
      )

      const url = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
      const thumbnailUrl = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${thumbnailKey}`

      return { url, thumbnailUrl }
    } catch (error) {
      logger.error('Error uploading photo:', error)
      throw error
    }
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      })
      
      return await getSignedUrl(this.s3, command, { expiresIn })
    } catch (error) {
      logger.error('Error generating signed URL:', error)
      throw error
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        })
      )
    } catch (error) {
      logger.error('Error deleting file:', error)
      throw error
    }
  }
}

export const storageService = new StorageService()
```

---

## 9. Background Jobs

### 9.1 Email Queue Processor

```typescript
// src/jobs/email.processor.ts
import Queue from 'bull'
import sgMail from '@sendgrid/mail'
import { logger } from '../utils/logger'
import { emailTemplates } from '../templates/email'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

const emailQueue = new Queue('email', process.env.REDIS_URL!)

emailQueue.process('investment-confirmation', async (job) => {
  const { userId, investmentId, propertyName, amount } = job.data

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    
    if (!user) throw new Error('User not found')

    const html = emailTemplates.investmentConfirmation({
      firstName: user.firstName,
      propertyName,
      amount,
      investmentId,
    })

    await sgMail.send({
      to: user.email,
      from: process.env.EMAIL_FROM!,
      subject: `Investment Confirmation - ${propertyName}`,
      html,
    })

    logger.info(`Investment confirmation email sent to ${user.email}`)
  } catch (error) {
    logger.error('Error sending investment confirmation:', error)
    throw error
  }
})

emailQueue.process('welcome', async (job) => {
  const { userId } = job.data

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    
    if (!user) throw new Error('User not found')

    const html = emailTemplates.welcome({
      firstName: user.firstName,
    })

    await sgMail.send({
      to: user.email,
      from: process.env.EMAIL_FROM!,
      subject: 'Welcome to Real Estate Invest',
      html,
    })

    logger.info(`Welcome email sent to ${user.email}`)
  } catch (error) {
    logger.error('Error sending welcome email:', error)
    throw error
  }
})

export { emailQueue }
```

---

## 10. Testing

### 10.1 Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageDirectory: 'coverage',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
}
```

### 10.2 Integration Test Example

```typescript
// tests/properties.test.ts
import request from 'supertest'
import app from '../src/index'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Properties API', () => {
  beforeAll(async () => {
    // Setup test database
    await prisma.$connect()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('GET /api/properties', () => {
    it('should return list of properties', async () => {
      const response = await request(app)
        .get('/api/properties')
        .expect(200)

      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('pagination')
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should filter by city', async () => {
      const response = await request(app)
        .get('/api/properties?city=Phoenix')
        .expect(200)

      const properties = response.body.data
      properties.forEach((property: any) => {
        expect(property.city).toBe('Phoenix')
      })
    })
  })

  describe('GET /api/properties/:id', () => {
    it('should return property details', async () => {
      const property = await prisma.property.findFirst()
      
      const response = await request(app)
        .get(`/api/properties/${property?.id}`)
        .expect(200)

      expect(response.body.id).toBe(property?.id)
      expect(response.body).toHaveProperty('photos')
      expect(response.body).toHaveProperty('virtualTours')
    })

    it('should return 404 for non-existent property', async () => {
      await request(app)
        .get('/api/properties/non-existent-id')
        .expect(404)
    })
  })
})
```

---

## 11. Package.json Scripts

```json
{
  "name": "real-estate-backend",
  "version": "1.0.0",
  "description": "Real Estate Investment Platform Backend",
  "main": "dist/index.js",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "start:prod": "NODE_ENV=production node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write 'src/**/*.{ts,js,json}'",
    "db:migrate": "prisma migrate dev",
    "db:migrate:prod": "prisma migrate deploy",
    "db:generate": "prisma generate",
    "db:seed": "ts-node prisma/seed.ts",
    "db:reset": "prisma migrate reset",
    "db:studio": "prisma studio",
    "queue:dashboard": "bull-dashboard"
  },
  "keywords": ["real-estate", "investment", "node", "express", "prisma"],
  "author": "",
  "license": "MIT"
}
```

---

## 12. Production Considerations

### 12.1 Security Best Practices

```typescript
// src/config/security.ts
export const securityConfig = {
  // CORS
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200,
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  // File upload
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ],
  },
  
  // Session
  session: {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  },
}
```

### 12.2 Monitoring & Logging

```typescript
// src/utils/logger.ts
import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    
    // File transport for errors
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '30d',
    }),
    
    // File transport for all logs
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
    }),
  ],
})
```

---

This Node.js backend setup provides a robust, scalable foundation for your real estate investment platform with Clerk authentication, PostgreSQL database, Redis caching, and all necessary services for production deployment.