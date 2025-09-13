# Tucson Investment Platform - Setup Guide

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ (or use Docker)
- Clerk account for authentication

## Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/JoelCThemmen/Tucson.git
   cd Tucson
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your Clerk keys
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up
   ```

   This will start:
   - PostgreSQL database on port 5432
   - Backend API on http://localhost:5000
   - Frontend app on http://localhost:5173

## Manual Setup (Without Docker)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   # Make sure PostgreSQL is running
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the backend server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Add your Clerk publishable key
   ```

4. **Start the frontend development server**
   ```bash
   npm run dev
   ```

## Clerk Configuration

1. **Create a Clerk account** at https://clerk.com

2. **Create a new application** in Clerk dashboard

3. **Get your API keys**:
   - Publishable Key (starts with `pk_`)
   - Secret Key (starts with `sk_`)

4. **Set up webhook** (for user sync):
   - Go to Webhooks in Clerk dashboard
   - Add endpoint: `http://your-domain/api/v1/auth/webhook`
   - Select events: `user.created`, `user.updated`, `user.deleted`
   - Copy the webhook secret

5. **Configure authentication methods**:
   - Enable Email/Password
   - Enable Social logins (Google, GitHub, etc.) as desired

## Database Migrations

Run migrations to set up the database schema:
```bash
cd backend
npx prisma migrate dev
```

View the database with Prisma Studio:
```bash
npx prisma studio
```

## Testing the Application

1. **Access the application** at http://localhost:5173

2. **Create an account** using the Sign Up button

3. **Verify Clerk webhook** is working:
   - Check that user appears in PostgreSQL after sign up
   - View logs in backend console

4. **Test profile editing**:
   - Navigate to Profile page
   - Edit and save profile information
   - Verify changes persist in database

## Available Scripts

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
Tucson/
├── backend/               # Node.js Express API
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   └── index.ts       # Server entry point
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── package.json
├── web/                   # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── layouts/       # Layout components
│   │   ├── services/      # API services
│   │   └── App.tsx        # Main app component
│   └── package.json
├── docker-compose.yml     # Docker orchestration
└── README.md
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database exists: `createdb tucson`

### Clerk Authentication Issues
- Verify API keys are correct
- Check webhook secret if user sync isn't working
- Ensure frontend and backend use matching keys

### Port Conflicts
- Backend runs on port 5000
- Frontend runs on port 5173
- PostgreSQL runs on port 5432
- Change ports in .env if needed

## Production Deployment

For production deployment:
1. Use environment-specific .env files
2. Enable HTTPS
3. Set up proper CORS origins
4. Use production database with backups
5. Configure Clerk production keys
6. Set up monitoring and logging

## Support

For issues or questions, please refer to the documentation or create an issue on GitHub.