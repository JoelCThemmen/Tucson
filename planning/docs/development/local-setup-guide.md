# Local Development Setup Guide - Kubuntu
## Real Estate Investment Platform

### Version 1.0
### Date: September 2025

---

## 1. Prerequisites - Kubuntu System Setup

### 1.1 System Requirements
- **OS**: Kubuntu 22.04 LTS or later
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: 20GB free space
- **Processor**: Multi-core processor (4+ cores recommended)

### 1.2 Essential Development Tools

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential build tools
sudo apt install -y build-essential curl wget git vim

# Install development libraries
sudo apt install -y libssl-dev libffi-dev python3-dev

# Install useful utilities
sudo apt install -y htop neofetch tree jq httpie
```

---

## 2. Node.js & Package Managers Setup

### 2.1 Install Node.js via NVM (Recommended)

```bash
# Install NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell configuration
source ~/.bashrc

# Install latest LTS Node.js
nvm install --lts
nvm use --lts
nvm alias default node

# Verify installation
node --version  # Should show v20.x.x or later
npm --version   # Should show 10.x.x or later
```

### 2.2 Install Yarn and PNPM

```bash
# Install Yarn
npm install -g yarn

# Install PNPM (faster, more efficient)
npm install -g pnpm

# Verify installations
yarn --version
pnpm --version
```

---

## 3. Database Setup

### 3.1 PostgreSQL Installation

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib postgis

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create development user and database
sudo -u postgres psql << EOF
CREATE USER realestate_dev WITH PASSWORD 'dev_password_123';
CREATE DATABASE realestate_dev OWNER realestate_dev;
GRANT ALL PRIVILEGES ON DATABASE realestate_dev TO realestate_dev;
\q
EOF

# Install pgAdmin4 (optional GUI)
curl -fsS https://www.pgadmin.org/static/packages_pgadmin_org.pub | sudo gpg --dearmor -o /usr/share/keyrings/packages-pgadmin-org.gpg
sudo sh -c 'echo "deb [signed-by=/usr/share/keyrings/packages-pgadmin-org.gpg] https://ftp.postgresql.org/pub/pgadmin/pgadmin4/apt/$(lsb_release -cs) pgadmin4 main" > /etc/apt/sources.list.d/pgadmin4.list'
sudo apt update
sudo apt install -y pgadmin4-desktop
```

### 3.2 Convex Setup (Alternative to PostgreSQL)

```bash
# Convex is cloud-based, no local installation needed
# Just install the CLI tool
npm install -g convex

# Create account and initialize later in project
# convex dev
```

### 3.3 Database Decision Matrix

| Feature | PostgreSQL | Convex |
|---------|-----------|---------|
| **Local Development** | ✅ Full control | ⚠️ Requires internet |
| **Real-time Updates** | ❌ Need additional setup | ✅ Built-in |
| **Scaling** | ⚠️ Manual configuration | ✅ Automatic |
| **Cost** | ✅ Free locally | 💰 Usage-based |
| **Type Safety** | ⚠️ Need ORM | ✅ TypeScript native |
| **Offline Development** | ✅ Yes | ❌ No |

**Recommendation**: Start with PostgreSQL for local development, migrate to Convex if real-time features become critical.

---

## 4. React Web Application Setup

### 4.1 Create React App with Vite

```bash
# Navigate to project root
cd ~/source/repos/Tucson

# Create React app with Vite (faster than CRA)
pnpm create vite@latest web --template react-ts

# Navigate to web directory
cd web

# Install dependencies
pnpm install

# Install additional packages for real estate platform
pnpm add \
  @clerk/clerk-react \
  @tanstack/react-query \
  @tanstack/react-router \
  axios \
  date-fns \
  react-hook-form \
  zod \
  @hookform/resolvers \
  recharts \
  mapbox-gl \
  react-map-gl \
  framer-motion \
  @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu \
  @radix-ui/react-tabs \
  tailwindcss \
  @tailwindcss/forms \
  @tailwindcss/typography \
  autoprefixer \
  postcss

# Development dependencies
pnpm add -D \
  @types/react \
  @types/react-dom \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  eslint \
  eslint-plugin-react \
  prettier \
  vitest \
  @testing-library/react \
  @testing-library/jest-dom
```

### 4.2 Configure Tailwind CSS

```bash
# Initialize Tailwind
npx tailwindcss init -p

# Update tailwind.config.js
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F5F6FA',
          100: '#E3E6EF',
          500: '#3B4371',
          600: '#283058',
          900: '#0A0E27',
        },
        gold: {
          500: '#DAA520',
          600: '#B8860B',
        },
        emerald: {
          500: '#10B981',
          600: '#047857',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
EOF
```

### 4.3 Project Structure

```bash
# Create project structure
mkdir -p src/{components,pages,hooks,utils,services,types,styles}
mkdir -p src/components/{common,properties,investments,dashboard}

# Create basic file structure
touch src/components/common/{Button,Card,Modal}.tsx
touch src/pages/{Home,Properties,PropertyDetail,Dashboard,Login}.tsx
touch src/services/{api,auth,properties}.ts
touch src/types/{property,user,investment}.ts
touch src/hooks/{useAuth,useProperties,useInvestments}.ts
```

---

## 5. React Native Mobile Setup

### 5.1 Install React Native CLI and Dependencies

```bash
# Install React Native CLI
npm install -g react-native-cli

# Install Android Studio dependencies
sudo apt install -y openjdk-11-jdk

# Set JAVA_HOME
echo "export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64" >> ~/.bashrc
echo "export PATH=\$PATH:\$JAVA_HOME/bin" >> ~/.bashrc
source ~/.bashrc

# Download and install Android Studio
# Visit: https://developer.android.com/studio
# Or use snap:
sudo snap install android-studio --classic
```

### 5.2 Create React Native Project

```bash
# Navigate to project root
cd ~/source/repos/Tucson

# Create React Native app with TypeScript
npx react-native init MobileApp --template react-native-template-typescript

# Navigate to mobile directory
mv MobileApp mobile
cd mobile

# Install iOS dependencies (if on Mac)
# cd ios && pod install && cd ..

# Install additional packages
yarn add \
  @clerk/clerk-react-native \
  @react-navigation/native \
  @react-navigation/native-stack \
  @react-navigation/bottom-tabs \
  @tanstack/react-query \
  react-native-screens \
  react-native-safe-area-context \
  react-native-gesture-handler \
  react-native-reanimated \
  react-native-vector-icons \
  react-native-maps \
  react-native-image-picker \
  react-native-async-storage \
  react-native-keychain \
  axios \
  date-fns

# Install development dependencies
yarn add -D \
  @types/react-native-vector-icons \
  prettier \
  eslint \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser
```

### 5.3 Configure Android Emulator

```bash
# Open Android Studio and configure AVD
android-studio

# Or use command line (after setting up Android SDK)
# Create AVD
avdmanager create avd -n "Pixel_5_API_31" -k "system-images;android-31;google_apis;x86_64"

# List AVDs
emulator -list-avds

# Start emulator
emulator -avd Pixel_5_API_31
```

---

## 6. Node.js Backend Setup

### 6.1 Initialize Backend Project

```bash
# Navigate to project root
cd ~/source/repos/Tucson

# Create backend directory
mkdir backend && cd backend

# Initialize Node.js project
pnpm init

# Install dependencies
pnpm add \
  express \
  @types/express \
  cors \
  @types/cors \
  helmet \
  compression \
  dotenv \
  @clerk/clerk-sdk-node \
  pg \
  @prisma/client \
  prisma \
  zod \
  express-validator \
  express-rate-limit \
  winston \
  morgan \
  jsonwebtoken \
  bcryptjs \
  multer \
  sharp \
  aws-sdk \
  node-cron \
  bull \
  ioredis

# Install development dependencies
pnpm add -D \
  @types/node \
  typescript \
  ts-node \
  ts-node-dev \
  nodemon \
  @types/compression \
  @types/morgan \
  @types/jsonwebtoken \
  @types/bcryptjs \
  @types/multer \
  eslint \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  prettier \
  jest \
  @types/jest \
  supertest \
  @types/supertest
```

### 6.2 Create TypeScript Configuration

```bash
# Create tsconfig.json
cat > tsconfig.json << 'EOF'
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
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF
```

### 6.3 Setup Prisma ORM

```bash
# Initialize Prisma
npx prisma init

# Configure schema for PostgreSQL
cat > prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                String   @id @default(uuid())
  clerkId           String   @unique
  email             String   @unique
  firstName         String?
  lastName          String?
  isAccredited      Boolean  @default(false)
  accreditedDate    DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  investments       Investment[]
}

model Property {
  id                String   @id @default(uuid())
  name              String
  address           Json
  type              String
  class             String
  totalUnits        Int
  yearBuilt         Int
  currentNOI        Float
  capRate           Float
  occupancyRate     Float
  targetIRR         Float
  minimumInvestment Float
  status            String
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  investments       Investment[]
  photos           PropertyPhoto[]
  virtualTours     VirtualTour[]
}

model Investment {
  id               String   @id @default(uuid())
  userId           String
  propertyId       String
  amount           Float
  ownershipPercent Float
  investmentDate   DateTime @default(now())
  status           String
  
  user             User     @relation(fields: [userId], references: [id])
  property         Property @relation(fields: [propertyId], references: [id])
}

model PropertyPhoto {
  id          String   @id @default(uuid())
  propertyId  String
  url         String
  category    String
  caption     String?
  order       Int
  
  property    Property @relation(fields: [propertyId], references: [id])
}

model VirtualTour {
  id          String   @id @default(uuid())
  propertyId  String
  type        String
  url         String
  embedCode   String?
  
  property    Property @relation(fields: [propertyId], references: [id])
}
EOF

# Create initial migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

---

## 7. Clerk Authentication Setup

### 7.1 Configure Clerk

```bash
# Create .env files in each project

# Backend .env
cat > backend/.env << 'EOF'
DATABASE_URL="postgresql://realestate_dev:dev_password_123@localhost:5432/realestate_dev"
CLERK_SECRET_KEY="sk_test_YOUR_CLERK_SECRET_KEY"
CLERK_PUBLISHABLE_KEY="pk_test_YOUR_CLERK_PUBLISHABLE_KEY"
JWT_SECRET="your-jwt-secret-key"
PORT=3001
NODE_ENV=development
EOF

# Web .env
cat > web/.env << 'EOF'
VITE_CLERK_PUBLISHABLE_KEY="pk_test_YOUR_CLERK_PUBLISHABLE_KEY"
VITE_API_URL="http://localhost:3001"
EOF

# Mobile .env
cat > mobile/.env << 'EOF'
CLERK_PUBLISHABLE_KEY="pk_test_YOUR_CLERK_PUBLISHABLE_KEY"
API_URL="http://10.0.2.2:3001"
EOF
```

### 7.2 Implement Clerk in Backend

```typescript
// backend/src/middleware/auth.ts
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

export const requireAuth = ClerkExpressRequireAuth({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { requireAuth } from './middleware/auth';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Public routes
app.get('/api/properties', getProperties);

// Protected routes
app.use('/api/investments', requireAuth, investmentRoutes);
app.use('/api/user', requireAuth, userRoutes);

app.listen(3001, () => {
  console.log('Backend running on http://localhost:3001');
});
```

---

## 8. Development Scripts

### 8.1 Package.json Scripts

```json
// backend/package.json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:seed": "ts-node prisma/seed.ts"
  }
}

// web/package.json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src/**/*.{ts,tsx}",
    "format": "prettier --write src/**/*.{ts,tsx}",
    "test": "vitest"
  }
}

// mobile/package.json
{
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "start": "react-native start",
    "test": "jest",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx"
  }
}
```

---

## 9. Docker Setup (Optional)

### 9.1 Docker Compose for Local Development

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgis/postgis:14-3.2
    environment:
      POSTGRES_USER: realestate_dev
      POSTGRES_PASSWORD: dev_password_123
      POSTGRES_DB: realestate_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://realestate_dev:dev_password_123@postgres:5432/realestate_dev
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app
      - /app/node_modules

  web:
    build: ./web
    ports:
      - "5173:5173"
    volumes:
      - ./web:/app
      - /app/node_modules

volumes:
  postgres_data:
```

---

## 10. VS Code Configuration

### 10.1 Recommended Extensions

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "mikestead.dotenv",
    "orta.vscode-jest",
    "ms-azuretools.vscode-docker"
  ]
}
```

### 10.2 VS Code Settings

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.updateImportsOnFileMove.enabled": "always",
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

---

## 11. Testing Setup

### 11.1 Run All Services

```bash
# Terminal 1: Start PostgreSQL
sudo systemctl start postgresql

# Terminal 2: Start Backend
cd backend && pnpm dev

# Terminal 3: Start Web App
cd web && pnpm dev

# Terminal 4: Start Mobile (Android)
cd mobile && yarn android

# Terminal 5: Run tests
cd backend && pnpm test
cd ../web && pnpm test
```

---

## 12. Deployment Preparation

### 12.1 Platform Comparison

| Platform | Best For | Pros | Cons |
|----------|----------|------|------|
| **Railway** | Full-stack | Simple, built-in PostgreSQL | Limited free tier |
| **Render** | Full-stack | Good free tier, auto-deploy | Cold starts on free tier |
| **Vercel** | Frontend only | Excellent DX, fast CDN | Backend limitations |
| **Supabase** | Backend + DB | Built-in auth, real-time | PostgreSQL only |
| **Digital Ocean** | Full control | Predictable pricing | More setup required |

### 12.2 Environment Variables for Production

```bash
# Production environment variables to set
DATABASE_URL=
CLERK_SECRET_KEY=
CLERK_PUBLISHABLE_KEY=
JWT_SECRET=
NODE_ENV=production
REDIS_URL=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET_NAME=
MATTERPORT_API_KEY=
MAPBOX_ACCESS_TOKEN=
SENTRY_DSN=
```

---

## Next Steps

1. **Set up Clerk account** at https://clerk.dev
2. **Configure Mapbox** for property maps
3. **Set up Matterport** developer account for virtual tours
4. **Configure AWS S3** for image storage
5. **Set up monitoring** with Sentry
6. **Configure CI/CD** with GitHub Actions

---

## Troubleshooting

### Common Issues

1. **PostgreSQL Connection Issues**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo journalctl -u postgresql

# Reset PostgreSQL password
sudo -u postgres psql -c "ALTER USER realestate_dev PASSWORD 'new_password';"
```

2. **Node Version Issues**
```bash
# Switch Node versions
nvm use 20
nvm alias default 20
```

3. **Android Emulator Issues**
```bash
# Kill and restart adb
adb kill-server
adb start-server

# Clear React Native cache
cd mobile
npx react-native start --reset-cache
```

4. **Port Already in Use**
```bash
# Find process using port
sudo lsof -i :3001
# Kill process
sudo kill -9 [PID]
```