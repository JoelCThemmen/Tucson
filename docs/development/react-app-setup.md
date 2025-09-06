# React Web Application Setup
## Real Estate Investment Platform

### Version 1.0
### Date: September 2025

---

## 1. Project Initialization

### 1.1 Create Vite React Project

```bash
# Navigate to Tucson directory
cd ~/source/repos/Tucson

# Create React app with Vite and TypeScript
pnpm create vite@latest web --template react-ts

cd web

# Install dependencies
pnpm install
```

### 1.2 Essential Dependencies

```bash
# Core dependencies
pnpm add \
  @clerk/clerk-react \
  @tanstack/react-query \
  @tanstack/react-router \
  axios \
  zustand \
  react-hook-form \
  @hookform/resolvers \
  zod

# UI Components
pnpm add \
  framer-motion \
  @radix-ui/react-dialog \
  @radix-ui/react-select \
  @radix-ui/react-tabs \
  @radix-ui/react-tooltip \
  @radix-ui/react-dropdown-menu \
  @radix-ui/react-switch \
  @radix-ui/react-slider \
  clsx \
  tailwind-merge \
  lucide-react

# Real Estate Specific
pnpm add \
  mapbox-gl \
  react-map-gl \
  recharts \
  react-number-format \
  date-fns \
  react-image-gallery \
  react-photo-view \
  embla-carousel-react

# Development dependencies
pnpm add -D \
  @types/react \
  @types/react-dom \
  @types/mapbox-gl \
  @vitejs/plugin-react \
  autoprefixer \
  postcss \
  tailwindcss \
  prettier \
  prettier-plugin-tailwindcss \
  eslint \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  eslint-plugin-react \
  eslint-plugin-react-hooks
```

---

## 2. Project Structure

### 2.1 Create Directory Structure

```bash
# Create comprehensive folder structure
mkdir -p src/{components,pages,features,hooks,services,store,types,utils,styles,assets}
mkdir -p src/components/{ui,layout,common}
mkdir -p src/features/{properties,investments,dashboard,auth,virtual-tours}
mkdir -p src/assets/{images,icons,fonts}
```

### 2.2 Folder Organization

```
src/
├── assets/           # Static assets
├── components/       # Reusable components
│   ├── ui/          # Base UI components (Button, Card, etc.)
│   ├── layout/      # Layout components (Header, Footer, Sidebar)
│   └── common/      # Common components (Loading, ErrorBoundary)
├── features/        # Feature-based modules
│   ├── properties/  # Property listing, details, gallery
│   ├── investments/ # Investment flow, portfolio
│   ├── dashboard/   # Investor dashboard
│   ├── auth/        # Authentication components
│   └── virtual-tours/ # Matterport integration
├── hooks/           # Custom React hooks
├── pages/           # Page components (route endpoints)
├── services/        # API services and external integrations
├── store/           # Zustand state management
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── styles/          # Global styles and Tailwind config
```

---

## 3. Configure Tailwind CSS

### 3.1 Initialize Tailwind

```bash
npx tailwindcss init -p
```

### 3.2 Update tailwind.config.js

```javascript
// tailwind.config.js
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#F5F6FA',
          100: '#E3E6EF',
          200: '#B6BED4',
          300: '#8891B5',
          400: '#5A6399',
          500: '#3B4371',
          600: '#283058',
          700: '#1E2447',
          800: '#141937',
          900: '#0A0E27',
        },
        gold: {
          400: '#F4C430',
          500: '#DAA520',
          600: '#B8860B',
        },
        emerald: {
          400: '#34D399',
          500: '#10B981',
          600: '#047857',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}

export default config
```

### 3.3 Global Styles

```css
/* src/styles/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221 83% 53%;
    --primary-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221 83% 53%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer utilities {
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
}
```

---

## 4. Core Component Library

### 4.1 Base UI Components

```typescript
// src/components/ui/button.tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
        gold: 'bg-gold-500 text-white hover:bg-gold-600',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

```typescript
// src/components/ui/card.tsx
import * as React from 'react'
import { cn } from '@/utils/cn'

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border bg-card text-card-foreground shadow-sm',
      className
    )}
    {...props}
  />
))
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

export { Card, CardHeader, CardTitle, CardDescription, CardContent }
```

---

## 5. Property Components

### 5.1 Property Card Component

```typescript
// src/features/properties/components/PropertyCard.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Home, TrendingUp, Users, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatPercent } from '@/utils/format'
import { Property } from '@/types/property'

interface PropertyCardProps {
  property: Property
  onViewDetails: (id: string) => void
  onVirtualTour: (id: string) => void
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onViewDetails,
  onVirtualTour,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="h-full"
    >
      <Card className="overflow-hidden h-full flex flex-col">
        <div className="relative h-64">
          <img
            src={property.heroImage}
            alt={property.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            {property.hasVirtualTour && (
              <Badge className="bg-gold-500 text-white">
                360° Tour
              </Badge>
            )}
            {property.renovationStatus === 'in_progress' && (
              <Badge className="bg-emerald-500 text-white">
                Renovating
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="absolute bottom-4 right-4 bg-white/90 hover:bg-white"
            onClick={() => onVirtualTour(property.id)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Virtual Tour
          </Button>
        </div>
        
        <CardHeader>
          <h3 className="text-xl font-semibold">{property.name}</h3>
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">
              {property.city}, {property.state}
            </span>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Units</p>
              <p className="font-semibold flex items-center">
                <Home className="h-4 w-4 mr-1" />
                {property.totalUnits}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Occupancy</p>
              <p className="font-semibold flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {formatPercent(property.occupancyRate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Target IRR</p>
              <p className="font-semibold text-emerald-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                {formatPercent(property.targetIRR)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Min Investment</p>
              <p className="font-semibold">
                {formatCurrency(property.minimumInvestment)}
              </p>
            </div>
          </div>
          
          {property.investmentOpen && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Funding Progress</span>
                <span>{formatPercent(property.fundingProgress)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gold-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${property.fundingProgress * 100}%` }}
                />
              </div>
            </div>
          )}
          
          <Button
            className="w-full"
            onClick={() => onViewDetails(property.id)}
          >
            View Details
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
```

### 5.2 Virtual Tour Component

```typescript
// src/features/virtual-tours/components/VirtualTourViewer.tsx
import React, { useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Maximize2, Home, Map, Ruler } from 'lucide-react'

interface VirtualTourViewerProps {
  propertyId: string
  matterportId: string
  showControls?: boolean
}

export const VirtualTourViewer: React.FC<VirtualTourViewerProps> = ({
  propertyId,
  matterportId,
  showControls = true,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  
  const handleFullscreen = () => {
    if (iframeRef.current) {
      iframeRef.current.requestFullscreen()
    }
  }
  
  return (
    <Card className="overflow-hidden">
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
        <iframe
          ref={iframeRef}
          src={`https://my.matterport.com/show/?m=${matterportId}&play=1`}
          className="absolute top-0 left-0 w-full h-full"
          allowFullScreen
          allow="vr; xr; accelerometer; magnetometer; gyroscope; autoplay"
        />
        
        {showControls && (
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleFullscreen}
              className="bg-white/90 backdrop-blur"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      {showControls && (
        <div className="p-4 bg-gray-50 flex gap-4">
          <Button variant="outline" size="sm">
            <Home className="mr-2 h-4 w-4" />
            Dollhouse View
          </Button>
          <Button variant="outline" size="sm">
            <Map className="mr-2 h-4 w-4" />
            Floor Plan
          </Button>
          <Button variant="outline" size="sm">
            <Ruler className="mr-2 h-4 w-4" />
            Measurements
          </Button>
        </div>
      )}
    </Card>
  )
}
```

---

## 6. State Management with Zustand

### 6.1 Create Store

```typescript
// src/store/useStore.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { Property } from '@/types/property'
import { User } from '@/types/user'

interface StoreState {
  // User state
  user: User | null
  setUser: (user: User | null) => void
  
  // Properties state
  properties: Property[]
  selectedProperty: Property | null
  setProperties: (properties: Property[]) => void
  setSelectedProperty: (property: Property | null) => void
  
  // UI state
  sidebarOpen: boolean
  toggleSidebar: () => void
  
  // Filters
  filters: {
    location?: string
    propertyType?: string
    minInvestment?: number
    maxInvestment?: number
  }
  setFilters: (filters: any) => void
}

export const useStore = create<StoreState>()(
  devtools(
    persist(
      (set) => ({
        // User
        user: null,
        setUser: (user) => set({ user }),
        
        // Properties
        properties: [],
        selectedProperty: null,
        setProperties: (properties) => set({ properties }),
        setSelectedProperty: (property) => set({ selectedProperty: property }),
        
        // UI
        sidebarOpen: true,
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        
        // Filters
        filters: {},
        setFilters: (filters) => set({ filters }),
      }),
      {
        name: 'real-estate-store',
      }
    )
  )
)
```

---

## 7. API Service Layer

### 7.1 Axios Configuration

```typescript
// src/services/api.ts
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await window.Clerk?.session?.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

### 7.2 Property Service

```typescript
// src/services/propertyService.ts
import { api } from './api'
import { Property, PropertyDetail } from '@/types/property'

export const propertyService = {
  async getProperties(filters?: any): Promise<Property[]> {
    const { data } = await api.get('/api/properties', { params: filters })
    return data
  },
  
  async getPropertyById(id: string): Promise<PropertyDetail> {
    const { data } = await api.get(`/api/properties/${id}`)
    return data
  },
  
  async getPropertyPhotos(id: string) {
    const { data } = await api.get(`/api/properties/${id}/photos`)
    return data
  },
  
  async getVirtualTour(id: string) {
    const { data } = await api.get(`/api/properties/${id}/virtual-tour`)
    return data
  },
  
  async getPropertyFinancials(id: string, period?: string) {
    const { data } = await api.get(`/api/properties/${id}/financials`, {
      params: { period }
    })
    return data
  },
}
```

---

## 8. React Query Setup

### 8.1 Query Client Configuration

```typescript
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App'
import './styles/globals.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
})

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <QueryClientProvider client={queryClient}>
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ClerkProvider>
  </React.StrictMode>
)
```

### 8.2 Custom Hooks

```typescript
// src/hooks/useProperties.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { propertyService } from '@/services/propertyService'

export const useProperties = (filters?: any) => {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => propertyService.getProperties(filters),
  })
}

export const useProperty = (id: string) => {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyService.getPropertyById(id),
    enabled: !!id,
  })
}

export const usePropertyPhotos = (id: string) => {
  return useQuery({
    queryKey: ['property-photos', id],
    queryFn: () => propertyService.getPropertyPhotos(id),
    enabled: !!id,
  })
}
```

---

## 9. Environment Configuration

### 9.1 Environment Variables

```bash
# .env.local
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_API_URL=http://localhost:3001
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
VITE_MATTERPORT_SDK_KEY=your_matterport_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

### 9.2 TypeScript Environment Types

```typescript
// src/types/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
  readonly VITE_API_URL: string
  readonly VITE_MAPBOX_ACCESS_TOKEN: string
  readonly VITE_MATTERPORT_SDK_KEY: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

---

## 10. Testing Setup

### 10.1 Install Testing Dependencies

```bash
pnpm add -D \
  vitest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jsdom \
  @vitest/ui
```

### 10.2 Vitest Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
})
```

### 10.3 Test Example

```typescript
// src/features/properties/components/__tests__/PropertyCard.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PropertyCard } from '../PropertyCard'

const mockProperty = {
  id: '1',
  name: 'Sunset Apartments',
  city: 'Phoenix',
  state: 'AZ',
  totalUnits: 100,
  occupancyRate: 0.95,
  targetIRR: 0.20,
  minimumInvestment: 50000,
  heroImage: '/test-image.jpg',
  hasVirtualTour: true,
  investmentOpen: true,
  fundingProgress: 0.65,
}

describe('PropertyCard', () => {
  it('renders property information correctly', () => {
    render(
      <PropertyCard
        property={mockProperty}
        onViewDetails={vi.fn()}
        onVirtualTour={vi.fn()}
      />
    )
    
    expect(screen.getByText('Sunset Apartments')).toBeInTheDocument()
    expect(screen.getByText('Phoenix, AZ')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('95%')).toBeInTheDocument()
  })
  
  it('calls onViewDetails when button clicked', async () => {
    const handleViewDetails = vi.fn()
    const user = userEvent.setup()
    
    render(
      <PropertyCard
        property={mockProperty}
        onViewDetails={handleViewDetails}
        onVirtualTour={vi.fn()}
      />
    )
    
    await user.click(screen.getByText('View Details'))
    expect(handleViewDetails).toHaveBeenCalledWith('1')
  })
})
```

---

## 11. Build & Deployment

### 11.1 Build Configuration

```json
// package.json scripts
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write 'src/**/*.{ts,tsx,css}'",
    "type-check": "tsc --noEmit"
  }
}
```

### 11.2 Production Build

```bash
# Build for production
pnpm build

# Preview production build locally
pnpm preview

# Analyze bundle size
pnpm add -D rollup-plugin-visualizer
# Add to vite.config.ts plugins
```

---

## 12. Performance Optimization

### 12.1 Code Splitting

```typescript
// src/App.tsx
import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'))
const PropertiesPage = lazy(() => import('./pages/PropertiesPage'))
const PropertyDetailPage = lazy(() => import('./pages/PropertyDetailPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/properties/:id" element={<PropertyDetailPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Suspense>
  )
}
```

### 12.2 Image Optimization

```typescript
// src/components/common/OptimizedImage.tsx
import { useState } from 'react'
import { cn } from '@/utils/cn'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  sizes?: string
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  sizes = '100vw',
}) => {
  const [isLoading, setIsLoading] = useState(true)
  
  return (
    <div className={cn('relative', className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        sizes={sizes}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        className={cn(
          'w-full h-full object-cover',
          isLoading && 'opacity-0'
        )}
      />
    </div>
  )
}
```

---

This React setup provides a solid foundation for your real estate investment platform with all the necessary components, state management, and optimizations for a production-ready application.