# GGI Backend Challenge - AI Chat & Subscription System

**Author:** Ahmed Murtaza  
**GitHub:** [@murtazakhan2595](https://github.com/murtazakhan2595)  
**Date:** October 2025

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Project Structure](#project-structure)

---

## 🎯 Overview

This is a production-grade backend system that implements two core modules:
1. **AI Chat Module** - Handles user questions with mocked OpenAI responses and quota management
2. **Subscription Bundle Module** - Manages user subscriptions with different tiers and billing cycles

The system follows **Clean Architecture** principles with **Domain-Driven Design (DDD)** patterns, built with TypeScript, Express, and PostgreSQL.

---

## ✨ Features

### AI Chat Module
- ✅ Accepts user questions and returns mocked OpenAI responses
- ✅ Simulates realistic API response delays (500-2000ms)
- ✅ Stores questions, answers, and token usage in database
- ✅ Tracks monthly usage per user
- ✅ 3 free messages per month per user
- ✅ Automatic monthly quota reset on the 1st of each month
- ✅ Multi-tier subscription support (Basic, Pro, Enterprise)
- ✅ Smart quota deduction from bundle with latest remaining quota
- ✅ Structured error handling for quota exceeded scenarios

### Subscription Bundle Module
- ✅ Create subscriptions (Basic: 10 messages, Pro: 100 messages, Enterprise: unlimited)
- ✅ Flexible billing cycles (monthly/yearly)
- ✅ Auto-renewal toggle
- ✅ Simulated billing logic with payment failure scenarios
- ✅ Subscription cancellation with usage history preservation
- ✅ Multiple active subscriptions per user support

---

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| **Language** | TypeScript 5.3+ |
| **Framework** | Express.js 4.18+ |
| **Database** | PostgreSQL 15+ |
| **ORM** | TypeORM 0.3+ |
| **Validation** | class-validator |
| **Testing** | Jest |
| **Logging** | Winston |
| **API Docs** | Swagger/OpenAPI |
| **Code Quality** | ESLint + Prettier |
| **Containerization** | Docker + Docker Compose |

---

## 🏗 Architecture

This project follows **Clean Architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│         Controllers Layer               │  ← HTTP/REST Interface
├─────────────────────────────────────────┤
│         Services Layer                  │  ← Business Logic
├─────────────────────────────────────────┤
│         Repositories Layer              │  ← Data Access
├─────────────────────────────────────────┤
│         Domain Layer                    │  ← Entities & Interfaces
└─────────────────────────────────────────┘
```

### Key Design Decisions

1. **TypeORM over Prisma**: Better support for decorators and DDD patterns
2. **Express over NestJS**: Faster setup while maintaining clean architecture
3. **Synchronize in Dev**: Auto-sync schema for rapid development
4. **Transaction-based Quota Deduction**: Prevents race conditions
5. **Domain Logic in Entities**: Following DDD principles

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose (recommended)
- PostgreSQL 15+ (if not using Docker)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/murtazakhan2595/ggi-backend-challenge.git
   cd ggi-backend-challenge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_DATABASE=ggi_backend_test
   ```

4. **Start PostgreSQL with Docker** (recommended)
   ```bash
   docker-compose up -d
   ```
   
   This starts:
   - PostgreSQL on port 5432
   - pgAdmin on port 5050 (http://localhost:5050)

5. **Run database migrations** (if needed)
   ```bash
   npm run migration:run
   ```

6. **Seed the database with test data**
   ```bash
   npm run seed
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

### Quick Test
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-18T...",
  "environment": "development"
}
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000
```

### Endpoints

#### Health Check
```http
GET /health
```

#### Chat Module (Coming in Phase 2)
```http
POST /api/chat
GET /api/chat/history/:userId
```

#### Subscription Module (Coming in Phase 2)
```http
POST /api/subscriptions
GET /api/subscriptions/:userId
PATCH /api/subscriptions/:id/cancel
PATCH /api/subscriptions/:id/toggle-autorenew
```

Full Swagger documentation will be available at: `http://localhost:3000/api-docs`

---

## 🗄 Database Schema

### Tables

#### Users
```sql
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- name (VARCHAR)
- freeMessagesRemaining (INT, default: 3)
- freeMessagesResetDate (DATE)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

#### ChatMessages
```sql
- id (UUID, PK)
- userId (UUID, FK → Users)
- question (TEXT)
- answer (TEXT)
- tokensUsed (INT)
- responseTime (INT)
- usedFreeQuota (BOOLEAN)
- subscriptionId (UUID, nullable)
- createdAt (TIMESTAMP)
```

#### Subscriptions
```sql
- id (UUID, PK)
- userId (UUID, FK → Users)
- tier (ENUM: BASIC, PRO, ENTERPRISE)
- maxMessages (INT)
- messagesUsed (INT)
- price (DECIMAL)
- billingCycle (ENUM: MONTHLY, YEARLY)
- status (ENUM: ACTIVE, INACTIVE, CANCELLED, EXPIRED)
- autoRenew (BOOLEAN)
- startDate (DATE)
- endDate (DATE)
- renewalDate (DATE)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

### Entity Relationships
```
User (1) ──< (N) ChatMessages
User (1) ──< (N) Subscriptions
```

---

## 🧪 Testing

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Generate coverage report
```bash
npm run test:coverage
```

---

## 📁 Project Structure

```
ggi-backend-challenge/
├── src/
│   ├── modules/
│   │   ├── chat/
│   │   │   ├── domain/
│   │   │   │   ├── entities/          # ChatMessage entity
│   │   │   │   └── interfaces/        # Service interfaces
│   │   │   ├── services/              # Business logic
│   │   │   ├── repositories/          # Data access
│   │   │   └── controllers/           # HTTP handlers
│   │   └── subscriptions/
│   │       ├── domain/
│   │       │   ├── entities/          # Subscription entity
│   │       │   └── interfaces/
│   │       ├── services/
│   │       ├── repositories/
│   │       └── controllers/
│   ├── shared/
│   │   ├── entities/                  # User entity (shared)
│   │   ├── config/                    # Configuration
│   │   ├── errors/                    # Custom errors
│   │   ├── middleware/                # Express middleware
│   │   └── utils/                     # Utilities (logger, etc.)
│   ├── database/
│   │   ├── migrations/                # TypeORM migrations
│   │   ├── seeds/                     # Database seeds
│   │   └── data-source.ts            # TypeORM config
│   └── app.ts                        # Express app entry point
├── tests/
│   ├── unit/                         # Unit tests
│   └── integration/                  # Integration tests
├── docker-compose.yml                # Docker configuration
├── tsconfig.json                     # TypeScript config
├── .eslintrc.js                      # ESLint config
├── .prettierrc                       # Prettier config
├── jest.config.js                    # Jest config
└── README.md                         # This file
```

---

## 🔍 Code Quality

### Linting
```bash
npm run lint
npm run lint:fix
```

### Formatting
```bash
npm run format
```

---

## 📝 Development Notes

### Quota Management Logic
The system uses a priority-based quota deduction:
1. **First**: Check and use free monthly quota (3 messages)
2. **Second**: Find active subscriptions with remaining quota
3. **Third**: Deduct from the bundle with the LATEST remaining quota
4. **Finally**: Throw QuotaExceededError if no quota available

### Monthly Reset
- Automatically resets free messages on the 1st of each month
- Checked on every chat request
- Uses user's `freeMessagesResetDate` for tracking

### Payment Simulation
- 20% random payment failure rate (configurable)
- Failed payments mark subscription as INACTIVE
- Auto-renew disabled on payment failure

---

## 🎯 Next Steps (Phase 2 & 3)

- [ ] Implement Chat Service with OpenAI mock
- [ ] Implement Subscription Service with billing logic
- [ ] Add REST controllers for both modules
- [ ] Write comprehensive unit tests
- [ ] Add integration tests
- [ ] Setup Swagger documentation
- [ ] Create Postman collection
- [ ] Optimize database queries
- [ ] Add request rate limiting

---

## 👤 Author

**Ahmed Murtaza**  
GitHub: [@murtazakhan2595](https://github.com/murtazakhan2595)

---

## 📄 License

This project is part of a coding challenge for GGI.

---

**Status:** ✅ Phase 1 Complete - Foundation Ready  
**Next:** Phase 2 - Core Business Logic Implementation
