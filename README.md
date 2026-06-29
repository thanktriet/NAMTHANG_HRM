# Nam Thắng HRM

Hệ thống quản lý nhân sự cho Tập đoàn Nam Thắng.

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, TailwindCSS, Shadcn UI
- **Backend**: NestJS (Microservices)
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Storage**: MinIO (S3-compatible)
- **Message Broker**: NATS
- **Auth**: JWT + RBAC
- **Realtime**: Socket.IO

## Quick Start

```bash
# 1. Clone & install
pnpm install

# 2. Start infrastructure
pnpm docker:up

# 3. Run migrations
pnpm db:migrate

# 4. Seed data
pnpm db:seed

# 5. Start all services
pnpm dev
```

## Services

| Port | Service |
|------|---------|
| 3000 | Web Frontend |
| 3001 | Landing Page |
| 4000 | API Gateway |
| 4001 | Recruitment Service |
| 4002 | Employee Service |
| 4003 | Attendance Service |
| 4004 | Payroll Service |
| 4005 | Contract Service |
| 4006 | Driver Service |
| 4007 | Asset Service |
| 4008 | KPI Service |
| 4009 | Document Service |
| 4010 | Notification Service |
| 5432 | PostgreSQL |
| 6379 | Redis |
| 9000 | MinIO |
| 4222 | NATS |
