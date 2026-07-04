# Flybook

多租户 SaaS 任务管理系统（飞书任务简化版）

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 19 + TypeScript + Vite + Tailwind + shadcn/ui |
| 认证 | Clerk |
| 后端 | Express 5 + TypeScript |
| ORM | Prisma |
| 数据库 | Neon (PostgreSQL) |

## 项目结构

```
flybook/
├── frontend/          # React 前端
├── backend/           # Express API
├── DESIGN.md          # 设计规范（飞书风）
└── README.md
```

## 快速开始

### 1. 配置 Clerk

1. 在 [Clerk Dashboard](https://dashboard.clerk.com) 创建应用
2. 开启 **Organizations**
3. 复制 API Keys 到环境变量

### 2. 后端

```bash
cd backend
cp .env.example .env
# 填写 DATABASE_URL (Neon) 和 Clerk Keys
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

API：http://localhost:3001

### 3. 前端

```bash
cd frontend
npm install
# 配置 VITE_CLERK_PUBLISHABLE_KEY 和 VITE_API_URL
npm run dev
```

访问 http://localhost:5173

## 页面路由

| 页面 | 路由 |
|------|------|
| 登录 | `/login` |
| 工作台 | `/dashboard` |
| 我的任务 | `/my-tasks` |
| 项目列表 | `/projects` |
| 看板 | `/projects/:id/board` |

## 开发说明

- 前端当前使用 **Mock 数据**，待接入 Clerk + 后端 API
- 后端 API 文档见 [backend/README.md](./backend/README.md)
- 设计规范见 [DESIGN.md](./DESIGN.md)

## 分工

- **前端**：页面、交互、组件（你）
- **后端**：Express + Prisma + Clerk API（已搭建骨架）
