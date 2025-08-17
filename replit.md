# Overview

This is a secure student election platform built with a modern full-stack architecture. The application enables students to participate in democratic elections with features including voter authentication, ballot casting, results viewing, and administrative election management. The system emphasizes security, transparency, and auditability with encrypted voting, session management, and comprehensive audit trails.

## Recent Updates (August 17, 2025)
- **GitHub Integration Prepared**: Complete project documentation created for GitHub deployment
- **Production Ready**: All TypeScript errors resolved, system fully functional
- **Documentation Complete**: README, deployment guide, and GitHub setup instructions created
- **Admin Access Configured**: User admin privileges established for election management
- **Sample Election Created**: Test election with candidates ready for demonstration

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side is built with React and TypeScript, utilizing a component-based architecture with shadcn/ui for consistent design patterns. The application uses Wouter for client-side routing and TanStack Query for server state management. The UI follows a responsive design pattern with Tailwind CSS for styling and supports both light and dark themes.

**Key Frontend Decisions:**
- **React with TypeScript**: Provides type safety and component reusability
- **Wouter over React Router**: Lightweight routing solution with minimal bundle size
- **TanStack Query**: Efficient server state management with caching and background updates
- **shadcn/ui Components**: Pre-built, accessible UI components with consistent design
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development

## Backend Architecture
The server follows an Express.js REST API pattern with TypeScript for type safety. Authentication is handled through Replit's OpenID Connect integration with session-based persistence. The application implements a storage abstraction layer that separates business logic from data access patterns.

**Key Backend Decisions:**
- **Express.js**: Mature and flexible web framework with extensive middleware ecosystem
- **Session-based Authentication**: Secure session management with PostgreSQL storage
- **Storage Abstraction**: Interface-based data layer for testability and maintainability
- **Middleware Pattern**: Request logging, authentication, and error handling through composable middleware

## Database Design
The database uses PostgreSQL with Drizzle ORM for type-safe database operations. The schema includes comprehensive audit logging and voting integrity features with foreign key relationships ensuring data consistency.

**Key Database Decisions:**
- **PostgreSQL**: ACID compliance for election data integrity
- **Drizzle ORM**: Type-safe database queries with excellent TypeScript integration
- **Audit Logging**: Complete trail of all election-related activities
- **Normalized Schema**: Separate tables for users, elections, candidates, votes, and audit logs

## Security Implementation
Security is implemented at multiple layers including encrypted database connections, secure session management, CSRF protection, and vote anonymization. The system prevents double voting through database constraints and maintains vote secrecy through encrypted ballot storage.

**Key Security Decisions:**
- **Replit Auth Integration**: Leverages institutional authentication for identity verification
- **Session Security**: HTTP-only cookies with secure flags and configurable expiration
- **Vote Anonymization**: Votes are stored separately from voter identity with cryptographic receipts
- **Database Encryption**: All sensitive data encrypted at rest and in transit

## Development Workflow
The application uses modern development tooling including Vite for fast development builds, ESBuild for production bundling, and TypeScript for compile-time error checking. The monorepo structure allows shared types between client and server.

**Key Development Decisions:**
- **Monorepo Structure**: Shared types and utilities between frontend and backend
- **Vite Development Server**: Fast hot module replacement and development experience
- **TypeScript Throughout**: End-to-end type safety from database to UI components
- **ESM Modules**: Modern JavaScript module system for better tree-shaking

# External Dependencies

## Database Services
- **Neon Serverless PostgreSQL**: Cloud-hosted PostgreSQL database with serverless scaling
- **Drizzle ORM**: Type-safe database toolkit with migration support

## Authentication Provider
- **Replit Authentication**: OpenID Connect provider for institutional user authentication
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## UI Component Libraries
- **Radix UI Primitives**: Headless, accessible UI components (@radix-ui/react-*)
- **Lucide React**: Consistent icon library with extensive symbol set
- **Tailwind CSS**: Utility-first CSS framework with design system integration

## Development Tools
- **Vite**: Frontend build tool with fast HMR and optimized production builds
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Form validation and state management with Zod schema validation
- **date-fns**: Date manipulation and formatting utilities

## Runtime Dependencies
- **Express.js**: Web application framework with middleware ecosystem
- **Passport.js**: Authentication middleware for OpenID Connect integration
- **Zod**: Runtime type validation and schema definition
- **class-variance-authority**: Type-safe variant styling for component systems