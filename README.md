# Website Section Generator

A fullstack application that generates website sections based on user ideas using React/Next.js frontend and NestJS/MongoDB backend.

## Features

- Real-time section generation with optimistic updates
- Intelligent caching system (5-minute duration)
- Debounced input with 500ms delay
- Request cancellation for better performance
- Industry-specific templates (bakery, restaurant, shop, portfolio)
- Responsive UI with loading states

## Tech Stack

### Frontend (client/)
- Next.js 15 (T3 App)
- TypeScript
- TailwindCSS

### Backend (api/)
- NestJS
- MongoDB with Mongoose
- TypeScript

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- MongoDB running locally
- pnpm (recommended) or npm

### Backend Setup
```bash
cd api
pnpm install
pnpm run start:dev
```
The API will run on `http://localhost:3001`

### Frontend Setup
```bash
cd client
pnpm install
pnpm run dev
```
The client will run on `http://localhost:3000`

### MongoDB Setup
Ensure MongoDB is running locally on the default port (27017). The application will create the necessary collections automatically.

## Usage

1. Navigate to `http://localhost:3000`
2. Enter a website idea (minimum 4 characters for live preview)
3. View optimistic sections immediately
4. Submit to generate and save AI-enhanced sections
5. Cached results load instantly on repeat queries

## API Endpoints

- `POST /api/projects` - Create new project with website idea
- `GET /api/projects/:id` - Fetch project sections by ID

## Development Scripts

### Frontend
- `npm run dev` - Start development server with Turbo
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checker

### Backend
- `npm run start:dev` - Start development server with watch mode
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Run ESLint with auto-fix

## Architecture Notes

- **Caching**: In-memory cache with 5-minute TTL
- **Optimistic UI**: Shows template-based sections immediately
- **Error Handling**: Graceful fallback to optimistic sections
- **Performance**: Request debouncing and abortion for efficiency
- **Type Safety**: Full TypeScript coverage with tRPC integration