# Overview

VINtage Garage Registry is a full-stack web application for automotive enthusiasts to track vehicle modifications, maintenance records, and costs. The system allows users to manage multiple vehicles, upload photos and documents, and monitor upcoming maintenance schedules. Built with modern web technologies, it provides a comprehensive dashboard for vehicle management with file upload capabilities, detailed cost tracking, and a vibrant community showcase featuring member vehicles.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component system for consistent, accessible design
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js REST API server
- **Language**: TypeScript with ES modules for modern JavaScript features
- **File Handling**: Multer for multipart form uploads with Sharp for image processing
- **Validation**: Zod schemas shared between frontend and backend for consistent validation
- **Development**: Custom Vite middleware integration for seamless full-stack development

## Data Layer
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: Normalized relational design with vehicles, modifications, maintenance records, and upcoming maintenance tables
- **Connection**: Neon Database serverless PostgreSQL for scalable cloud hosting
- **Migrations**: Drizzle Kit for schema migrations and database management
- **Storage**: In-memory storage implementation with interface for future database integration

## File Management
- **Upload Strategy**: Local file system storage with organized directory structure
- **File Types**: Images (photos) and documents (PDF, images, text files) with type validation
- **Processing**: Sharp library for image optimization and processing
- **Size Limits**: 10MB maximum file size with proper error handling

## Authentication & Authorization
- **Current State**: Mock user system for development (user ID: "mock-user-id")
- **Session Management**: Express session handling prepared for future authentication integration
- **Database Schema**: User table structure ready for authentication implementation

## API Design
- **Architecture**: RESTful API with consistent endpoint structure
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes
- **Logging**: Request/response logging with performance metrics
- **File Endpoints**: Dedicated routes for file uploads and static file serving

## Development & Deployment
- **Development Server**: Vite dev server with HMR and Express API integration
- **Build Process**: Vite for frontend bundling and esbuild for backend compilation
- **Environment**: Environment-based configuration with DATABASE_URL for database connection
- **Code Quality**: TypeScript strict mode with comprehensive type checking