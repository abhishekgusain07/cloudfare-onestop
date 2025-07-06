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
├── 📄 Configuration Files
│   ├── package.json                 # Main dependencies and scripts
│   ├── tsconfig.json               # TypeScript configuration
│   ├── tailwind.config.ts          # Tailwind CSS configuration
│   ├── next.config.js              # Next.js configuration
│   ├── drizzle.config.ts           # Database ORM configuration
│   ├── docker-compose.yml          # Docker orchestration
│   └── env.example                 # Environment variables template
│
├── 🏠 Frontend (Next.js App)
│   └── src/
│       ├── 📱 App Router Pages
│       │   ├── (auth)/             # Authentication routes
│       │   │   ├── sign-in/
│       │   │   └── sign-up/
│       │   ├── (dashboard)/        # Protected dashboard routes
│       │   │   ├── dashboard/
│       │   │   └── slide/
│       │   ├── (tools)/            # Tool-specific routes
│       │   │   └── tweettovideo/
│       │   ├── api/                # API routes
│       │   │   ├── (tools)/        # Tool-specific APIs
│       │   │   ├── auth/           # Authentication APIs
│       │   │   ├── cloudinary/     # Image upload APIs
│       │   │   ├── payments/       # Stripe payment APIs
│       │   │   ├── render/         # Video rendering APIs
│       │   │   ├── slideshow/      # Slideshow management APIs
│       │   │   └── user/           # User management APIs
│       │   ├── create/             # Video creation pages
│       │   ├── slideshow/          # Slideshow editor
│       │   └── onboarding/         # User onboarding
│       │
│       ├── 🧩 Components
│       │   ├── ui/                 # Reusable UI components (shadcn/ui)
│       │   ├── remotion/           # Video composition components
│       │   ├── slideshow/          # Slideshow editor components
│       │   ├── feedback/           # Feedback system components
│       │   └── homepage/           # Landing page components
│       │
│       ├── 🗄️ Database
│       │   ├── schema.ts           # Drizzle ORM schema definitions
│       │   ├── drizzle.ts          # Database connection
│       │   └── migrations/         # Database migration files
│       │
│       ├── 🛠️ Utilities & Libraries
│       │   ├── lib/                # Core libraries
│       │   │   ├── auth.ts         # Authentication utilities
│       │   │   ├── cloudinary/     # Cloudinary integration
│       │   │   └── utils.ts        # General utilities
│       │   ├── hooks/              # Custom React hooks
│       │   ├── store/              # State management (Zustand)
│       │   └── utils/              # Utility functions
│       │
│       └── 📋 Configuration
│           ├── config.ts           # App configuration
│           └── env.ts              # Environment variables
│
├── ⚙️ Backend (Express.js)
│   ├── src/
│   │   └── server.ts              # Express server for video rendering
│   ├── package.json               # Backend dependencies
│   ├── Dockerfile                 # Backend containerization
│   └── renders/                   # Rendered video storage
│
├── 🎨 Public Assets
│   ├── images/                    # Static images
│   ├── videos/                    # Video assets
│   ├── music/                     # Audio assets
│   └── remotion/                  # Remotion-specific assets
│
└── 📚 Documentation
    ├── README.md                  # Main project documentation
    ├── architecture.md            # System architecture overview
    ├── plan.md                    # Development roadmap
    └── claude.md                  # AI assistant notes
```

---

## 🏛️ Architecture Overview

### Frontend Architecture (Next.js 15 + App Router)

#### **Core Technologies**
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand
- **Authentication**: Better Auth
- **Database**: Drizzle ORM with PostgreSQL

#### **Key Application Features**

1. **Authentication System** (`src/app/(auth)/`)
   - Sign-in/Sign-up pages
   - OAuth integration
   - Session management

2. **Dashboard** (`src/app/(dashboard)/`)
   - User dashboard with project overview
   - Slide management interface

3. **Video Creation Tools** (`src/app/(tools)/`)
   - Tweet-to-video converter
   - AI-powered video generation

4. **Slideshow Editor** (`src/app/slideshow/`)
   - Drag-and-drop interface
   - Real-time preview
   - AI image generation

#### **Component Architecture**

```
src/components/
├── ui/                    # Reusable UI components
│   ├── button.tsx        # Button variants
│   ├── dialog.tsx        # Modal dialogs
│   ├── form.tsx          # Form components
│   └── ...               # Other shadcn/ui components
├── remotion/             # Video composition components
│   ├── Root.tsx          # Main video composition
│   ├── videoComposition.tsx
│   └── videoEditor.tsx
├── slideshow/            # Slideshow editor components
│   ├── SlideshowEditor.tsx
│   ├── EditingCanvas.tsx
│   └── StylingToolbar.tsx
└── feedback/             # User feedback system
    ├── FeedbackButton.tsx
    └── FeedbackModal.tsx
```

### Backend Architecture (Express.js)

#### **Core Technologies**
- **Framework**: Express.js with TypeScript
- **Video Rendering**: Remotion
- **Cloud Storage**: AWS SDK (Cloudflare R2)
- **File Processing**: FFmpeg

#### **API Endpoints**

```
/api/
├── auth/                 # Authentication endpoints
├── payments/             # Stripe payment processing
│   ├── create-checkout-session/
│   └── webhook/
├── render/               # Video rendering
│   ├── route.ts          # Start render job
│   ├── [renderId]/       # Check render status
│   └── lambda/           # Serverless rendering
├── slideshow/            # Slideshow management
│   ├── route.ts          # CRUD operations
│   ├── [id]/             # Individual slideshow
│   └── slides/           # Slide management
├── cloudinary/           # Image upload
│   ├── upload/
│   └── upload-buffer/
└── user/                 # User management
    ├── onboarding/
    └── check-onboarding/
```

---

## 🗄️ Database Schema

### Core Tables

#### **Authentication Tables**
- `user` - User accounts and profiles
- `session` - User sessions
- `account` - OAuth account links
- `verification` - Email verification

#### **Subscription Tables**
- `subscriptions` - User subscription data
- `subscription_plans` - Available plans
- `invoices` - Payment history

#### **Content Tables**
- `videos` - Video projects
- `video_assets` - Video files and metadata
- `video_clips` - Video timeline clips
- `slideshows` - Slideshow projects
- `slides` - Individual slides
- `user_image_collections` - User image libraries
- `user_images` - Uploaded images

#### **Feedback System**
- `feedback` - User feedback and ratings

---

## 🔧 Key Integrations

### **Payment Processing**
- **Stripe**: Subscription management and payments
- **Webhooks**: Payment event handling

### **Cloud Services**
- **Cloudflare R2**: Video and image storage
- **Cloudinary**: Image processing and optimization

### **AI Services**
- **OpenAI**: Text generation and processing
- **ElevenLabs**: Text-to-speech
- **AssemblyAI**: Audio transcription

### **Analytics & Monitoring**
- **PostHog**: Product analytics and feature flags
- **Sentry**: Error tracking and performance monitoring

### **Authentication**
- **Better Auth**: Modern authentication system
- **OAuth Providers**: Google, GitHub, etc.

---

## 🚀 Development Workflow

### **Local Development**
```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Database operations
bun run db:generate    # Generate migrations
bun run db:push        # Push schema changes
```

### **Docker Deployment**
```bash
# Build and run with Docker Compose
docker-compose up --build

# Access services
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

### **Environment Configuration**
Key environment variables:
- `DATABASE_URL` - PostgreSQL connection
- `STRIPE_SECRET_KEY` - Payment processing
- `CLOUDFLARE_R2_*` - Cloud storage
- `POSTHOG_KEY` - Analytics
- `SENTRY_DSN` - Error monitoring

---

## 📊 Performance & Optimization

### **Video Optimization**
- **Preview Optimization**: Lower-resolution previews for faster loading
- **Streaming**: Optimized video files with proper moov atom placement
- **CDN**: Cloudflare R2 for global content delivery

### **Frontend Performance**
- **Next.js 15**: Latest performance optimizations
- **Turbopack**: Fast development builds
- **Code Splitting**: Automatic route-based splitting

### **Backend Performance**
- **Async Rendering**: Non-blocking video processing
- **Caching**: In-memory render status tracking
- **Streaming**: Efficient file serving

---

## 🔒 Security Features

### **Authentication & Authorization**
- **Better Auth**: Modern, secure authentication
- **Session Management**: Secure session handling
- **Route Protection**: Middleware-based access control

### **Data Protection**
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Drizzle ORM
- **XSS Protection**: React's built-in protections

### **Payment Security**
- **Stripe**: PCI-compliant payment processing
- **Webhook Verification**: Secure payment event handling

---

## 📈 Scalability Considerations

### **Horizontal Scaling**
- **Stateless Backend**: Easy containerization
- **Database**: PostgreSQL with connection pooling
- **CDN**: Cloudflare R2 for global content delivery

### **Performance Monitoring**
- **Sentry**: Real-time error tracking
- **PostHog**: User behavior analytics
- **Custom Metrics**: Render performance tracking

### **Future Enhancements**
- **Serverless Rendering**: AWS Lambda integration
- **Microservices**: Service decomposition
- **Caching Layer**: Redis for session and data caching

---

## 🛠️ Development Tools

### **Code Quality**
- **TypeScript**: Type safety and better DX
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting

### **Database Management**
- **Drizzle ORM**: Type-safe database operations
- **Drizzle Kit**: Migration and schema management

### **Testing**
- **Unit Tests**: Component and utility testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: User workflow testing

---

## 📚 Additional Resources

### **Documentation**
- [README.md](./README.md) - Main project documentation
- [architecture.md](./architecture.md) - Detailed architecture overview
- [plan.md](./plan.md) - Development roadmap

### **External Dependencies**
- [Next.js Documentation](https://nextjs.org/docs)
- [Remotion Documentation](https://www.remotion.dev/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Better Auth Documentation](https://auth.better-auth.com/)

---

*This document provides a comprehensive overview of the One Stop Marketing AI UGC platform. For specific implementation details, refer to the individual files and their inline documentation.* 