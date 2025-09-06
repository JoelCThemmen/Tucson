# Tucson - Real Estate Investment Platform 🏢

A modern, full-stack real estate investment platform that connects accredited investors with premium multi-family property opportunities, targeting 20% annual returns through value-add strategies.

## 🎯 Overview

Tucson is a comprehensive investment platform specializing in:
- Multi-family apartment complexes (50-500 units)
- Value-add renovation opportunities
- Professional property management
- Transparent investor communications
- Immersive property showcases with virtual tours

## 🚀 Features

### For Investors
- **Property Discovery** - Browse curated multi-family investment opportunities
- **Virtual Tours** - Explore properties with Matterport 3D walkthroughs
- **Investment Dashboard** - Track portfolio performance and distributions
- **Document Center** - Access PPMs, financials, and legal documents
- **Real-time Updates** - Monthly statements and property performance metrics

### For Administrators
- **Property Management** - Full CRUD operations for property listings
- **Investor Relations** - Track investments and manage distributions
- **Analytics Dashboard** - Monitor platform metrics and user engagement
- **Document Management** - Upload and organize property documents
- **User Verification** - Manage accredited investor status

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework with TypeScript
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Clerk** - Authentication and user management
- **React Query** - Server state management
- **Zustand** - Client state management
- **Mapbox** - Interactive property maps
- **Framer Motion** - Animations

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Prisma** - ORM and database toolkit
- **PostgreSQL** - Primary database
- **Redis** - Caching and sessions
- **Bull** - Job queue management
- **Sharp** - Image processing

### Infrastructure
- **Docker** - Containerization (optional)
- **AWS S3** - Media storage
- **SendGrid** - Email service
- **Matterport** - Virtual tours

## 📁 Project Structure

```
tucson/
├── web/                    # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── features/       # Feature-based modules
│   │   ├── pages/         # Route pages
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils/         # Utility functions
│   └── package.json
│
├── backend/               # Node.js API server
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── prisma/       # Database schema
│   └── package.json
│
├── mobile/               # React Native app (future)
│
└── planning/            # Documentation and planning
    ├── docs/
    │   ├── planning/    # Strategy documents
    │   └── development/ # Setup guides
    └── .env.local      # Environment variables (not committed)
```

## 🚦 Getting Started

### Prerequisites
- Node.js 20+ and npm/pnpm
- PostgreSQL 14+
- Redis (optional for caching)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/tucson.git
cd tucson
```

2. **Set up environment variables**
```bash
# Backend (.env)
cp backend/.env.example backend/.env
# Add your Clerk keys, database URL, etc.

# Frontend (.env)
cp web/.env.example web/.env
# Add your Clerk publishable key, API URL, etc.
```

3. **Install dependencies**
```bash
# Backend
cd backend
pnpm install

# Frontend
cd ../web
pnpm install
```

4. **Set up the database**
```bash
cd backend
npx prisma migrate dev
npx prisma db seed  # Optional: Add sample data
```

5. **Start development servers**
```bash
# Terminal 1: Backend
cd backend
pnpm dev

# Terminal 2: Frontend
cd web
pnpm dev
```

6. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Prisma Studio: http://localhost:5555

## 🔧 Configuration

### Database
The application uses PostgreSQL. Update the `DATABASE_URL` in `backend/.env`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tucson"
```

### Authentication
Clerk is used for authentication. Add your keys to the environment files:
- Backend: `CLERK_SECRET_KEY` in `backend/.env`
- Frontend: `VITE_CLERK_PUBLISHABLE_KEY` in `web/.env`

## 📝 API Documentation

### Authentication
All API endpoints except public property listings require authentication via Clerk.

### Key Endpoints
- `GET /api/properties` - List all properties
- `GET /api/properties/:id` - Get property details
- `POST /api/investments` - Create investment
- `GET /api/users/portfolio` - Get user's portfolio

## 🧪 Testing

```bash
# Backend tests
cd backend
pnpm test

# Frontend tests
cd web
pnpm test
```

## 📦 Deployment

### Production Build
```bash
# Backend
cd backend
pnpm build
pnpm start:prod

# Frontend
cd web
pnpm build
# Deploy dist/ to your hosting service
```

### Recommended Hosting
- **Backend**: Railway, Render, or DigitalOcean
- **Frontend**: Vercel or Netlify
- **Database**: Railway PostgreSQL or Supabase

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential. All rights reserved.

## 👥 Team

- **Project Lead** - Real Estate Operations
- **Tech Lead** - Platform Development
- **UI/UX Designer** - User Experience

## 📞 Support

For support, email support@tucson-invest.com or open an issue in this repository.

## 🔒 Security

- Never commit `.env` files
- Keep Clerk keys secure
- Use environment variables for all sensitive data
- Regular security audits recommended

---

Built with ❤️ for real estate investors