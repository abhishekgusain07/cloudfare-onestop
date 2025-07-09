# Project Navigation - One Stop Marketing AI UGC Platform

## 🏗️ Project Overview

**One Stop Marketing** is a comprehensive AI-powered video creation platform built with Next.js, TypeScript, and Remotion. The application enables users to create short-form videos, slideshows, and social media content through an intuitive web interface.

### Key Features
- 🎥 Video creation with Remotion
- 📱 Slideshow editor with drag-and-drop interface
- 🎨 AI-powered image generation
- 💳 Subscription management with Stripe
- 🔐 Authentication with Better Auth
- 📊 Analytics with PostHog
- 🚨 Error monitoring with Sentry
- ☁️ Cloud storage with Cloudflare R2

---

## 📁 Project Structure

```
cloudfare_onestopmarketing/
├── architecture.md                # System architecture overview
├── auth-schema.ts                 # Auth schema definitions
├── backend/                       # Backend (Express.js)
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   ├── r2-config-example.env
│   ├── renders/
│   ├── src/
│   │   └── server.ts
│   ├── test-r2-connection.mjs
│   └── tsconfig.json
├── bun.lockb                      # Bun package lock
├── claude.md                      # AI assistant notes
├── components.json                # Component registry/config
├── docker-compose.yml             # Docker orchestration
├── Dockerfile.frontend            # Frontend Dockerfile
├── drizzle.config.ts              # Drizzle ORM config
├── env.example                    # Environment variables template
├── eslint.config.mjs              # ESLint config
├── next.config.js / .mjs / .ts    # Next.js config (multiple formats)
├── package.json                   # Main dependencies and scripts
├── package-lock.json
├── plan.md                        # Development roadmap
├── postcss.config.mjs             # PostCSS config
├── projectnavigation.md           # This navigation file
├── public/                        # Static assets
│   ├── 1stop.png, 1stoplogo.png, drizzle.svg, ...
│   ├── music/                     # Audio assets
│   ├── remotion/                  # Remotion assets
│   ├── renders/                   # Rendered videos
│   ├── socialslogo/               # Social media icons
│   ├── videos/                    # Video assets
│   └── ...
├── README-REMOTION.md             # Remotion-specific docs
├── README.md                      # Main project documentation
├── sentry.edge.config.ts          # Sentry edge config
├── sentry.server.config.ts        # Sentry server config
├── slideshoweditorplan.md         # Slideshow editor planning
├── src/
│   ├── actions/
│   │   └── feedback.ts            # Feedback actions
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/                # Auth routes (sign-in, sign-up)
│   │   ├── (dashboard)/           # Dashboard routes
│   │   ├── (tools)/               # Tool-specific routes (e.g., tweettovideo)
│   │   ├── api/                   # API routes (tools, auth, cloudinary, payments, render, slideshow, user, etc.)
│   │   ├── auth/                  # Onboarding UI
│   │   ├── components/            # Landing/marketing components
│   │   ├── create/                # Avatar/video creation
│   │   ├── ghibli/                # Ghibli generator
│   │   ├── onboarding/            # User onboarding
│   │   ├── onlypaid/              # Paid user restriction page
│   │   ├── profile/               # User profile
│   │   ├── sentry-example-page/   # Sentry test page
│   │   ├── slideshow/             # Slideshow editor
│   │   └── ...                    # Other pages (error, not-found, etc.)
│   ├── components/                # App-wide components
│   │   ├── feedback/              # Feedback system
│   │   ├── homepage/              # Landing page
│   │   ├── remotion/              # Video composition/editor components
│   │   ├── ui/                    # Reusable UI (shadcn/ui)
│   │   └── ...
│   ├── config.ts                  # App config
│   ├── db/                        # Database
│   │   ├── drizzle.ts             # Drizzle ORM connection
│   │   ├── migrations/            # DB migrations
│   │   └── schema.ts              # DB schema
│   ├── env.ts                     # Environment variables
│   ├── hooks/                     # Custom React hooks
│   ├── instrumentation-client.ts  # Sentry/PostHog client
│   ├── instrumentation.ts         # Sentry/PostHog server
│   ├── lib/                       # Core libraries (auth, cloudinary, posthog, utils)
│   ├── middleware.ts              # Middleware
│   ├── remotion.config.ts         # Remotion config
│   ├── store/                     # Zustand stores
│   └── utils/                     # Utility functions
├── tailwind.config.ts             # Tailwind CSS config
├── temp.js                        # Temporary scripts
├── test/                          # Test scripts/assets
│   ├── test-upload-image.mjs
│   ├── test-upload-simple.mjs
│   └── test-upload.png
├── todo.txt                       # TODOs
└── tsconfig.json                  # TypeScript config
```

---

## 🏛️ Architecture Overview

### Frontend Architecture (Next.js 15 + App Router)
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand
- **Authentication**: Better Auth
- **Database**: Drizzle ORM with PostgreSQL

#### **Key Application Features**
1. **Authentication System** (`src/app/(auth)/`)
2. **Dashboard** (`src/app/(dashboard)/`)
3. **Video Creation Tools** (`src/app/(tools)/`)
4. **Slideshow Editor** (`src/app/slideshow/`)
5. **Landing & Onboarding** (`src/app/components/`, `src/app/onboarding/`)
6. **Profile & Subscription** (`src/app/profile/`, `src/app/onlypaid/`)

#### **Component Architecture**
```
src/components/
├── ui/                    # Reusable UI components
├── remotion/              # Video composition/editor components
├── slideshow/             # Slideshow editor components
├── feedback/              # User feedback system
├── homepage/              # Landing page components
└── ...
```

### Backend Architecture (Express.js)
- **Framework**: Express.js with TypeScript
- **Video Rendering**: Remotion
- **Cloud Storage**: AWS SDK (Cloudflare R2)
- **File Processing**: FFmpeg

#### **API Endpoints**
```
src/app/api/
├── (tools)/               # Tool-specific APIs
├── auth/                  # Authentication APIs
├── cloudinary/            # Image upload APIs
├── payments/              # Stripe payment APIs
├── render/                # Video rendering APIs
├── slideshow/             # Slideshow management APIs
├── user/                  # User management APIs
└── ...
```

---

## 🗄️ Database Schema

### Core Tables
- `user`, `session`, `account`, `verification` (auth)
- `subscriptions`, `subscription_plans`, `invoices` (payments)
- `videos`, `video_assets`, `video_clips`, `slideshows`, `slides`, `user_image_collections`, `user_images` (content)
- `feedback` (feedback system)

---

## 🔧 Key Integrations
- **Stripe**: Subscription management and payments
- **Cloudflare R2**: Video and image storage
- **Cloudinary**: Image processing and optimization
- **OpenAI**: Text generation and processing
- **ElevenLabs**: Text-to-speech
- **AssemblyAI**: Audio transcription
- **PostHog**: Product analytics and feature flags
- **Sentry**: Error tracking and performance monitoring
- **Better Auth**: Modern authentication system
- **OAuth Providers**: Google, GitHub, etc.

---

## 🚀 Development Workflow

### Local Development
```bash
bun install
bun run dev
bun run db:generate    # Generate migrations
bun run db:push        # Push schema changes
```

### Docker Deployment
```bash
docker-compose up --build
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

### Environment Configuration
- `DATABASE_URL` - PostgreSQL connection
- `STRIPE_SECRET_KEY` - Payment processing
- `CLOUDFLARE_R2_*` - Cloud storage
- `POSTHOG_KEY` - Analytics
- `SENTRY_DSN` - Error monitoring

---

## 📊 Performance & Optimization
- **Preview Optimization**: Lower-resolution previews for faster loading
- **Streaming**: Optimized video files with proper moov atom placement
- **CDN**: Cloudflare R2 for global content delivery
- **Next.js 15**: Latest performance optimizations
- **Turbopack**: Fast development builds
- **Code Splitting**: Automatic route-based splitting
- **Async Rendering**: Non-blocking video processing
- **Caching**: In-memory render status tracking
- **Streaming**: Efficient file serving

---

## 🔒 Security Features
- **Better Auth**: Modern, secure authentication
- **Session Management**: Secure session handling
- **Route Protection**: Middleware-based access control
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Drizzle ORM
- **XSS Protection**: React's built-in protections
- **Stripe**: PCI-compliant payment processing
- **Webhook Verification**: Secure payment event handling

---

## 📈 Scalability Considerations
- **Stateless Backend**: Easy containerization
- **Database**: PostgreSQL with connection pooling
- **CDN**: Cloudflare R2 for global content delivery
- **Sentry**: Real-time error tracking
- **PostHog**: User behavior analytics
- **Custom Metrics**: Render performance tracking
- **Serverless Rendering**: AWS Lambda integration (future)
- **Microservices**: Service decomposition (future)
- **Caching Layer**: Redis for session and data caching (future)

---

## 🛠️ Development Tools
- **TypeScript**: Type safety and better DX
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Drizzle ORM**: Type-safe database operations
- **Drizzle Kit**: Migration and schema management
- **Unit/Integration/E2E Tests**: Comprehensive testing

---

## 📚 Additional Resources
- [README.md](./README.md) - Main project documentation
- [architecture.md](./architecture.md) - Detailed architecture overview
- [plan.md](./plan.md) - Development roadmap
- [Next.js Documentation](https://nextjs.org/docs)
- [Remotion Documentation](https://www.remotion.dev/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Better Auth Documentation](https://auth.better-auth.com/)

---

*This document provides a comprehensive overview of the One Stop Marketing AI UGC platform. For specific implementation details, refer to the individual files and their inline documentation.* 