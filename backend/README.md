# Flybook Backend API

基于 **Express + Prisma + Neon PostgreSQL + Clerk** 的多租户任务管理后端。

## 技术栈

| 组件 | 选型 |
|------|------|
| 运行时 | Node.js + TypeScript |
| 框架 | Express 5 |
| ORM | Prisma |
| 数据库 | Neon (PostgreSQL) |
| 认证 | Clerk (@clerk/express) |

## 快速开始

### 1. 配置环境变量

```bash
cp .env.example .env
```

填写以下变量：

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | Neon 连接串 |
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys |
| `CLERK_PUBLISHABLE_KEY` | 前端也需要 |
| `CLERK_WEBHOOK_SECRET` | Clerk Webhooks（可选） |
| `FRONTEND_URL` | 默认 `http://localhost:5173` |

### 2. 安装依赖

```bash
npm install
```

### 3. 初始化数据库

```bash
npm run db:generate
npm run db:migrate   # 推荐：应用迁移到 Neon
# 或 npm run db:push  # 快速原型，不记录迁移历史
npm run db:seed      # 填充演示数据（可选）
```

首次连接 Neon 时，确保 `DATABASE_URL` 包含 `?sslmode=require`。

### 4. 启动服务

```bash
npm run dev
```

API 地址：http://localhost:3001

## API 文档

### 认证

所有 `/api/v1/*` 接口需要 Header：

```
Authorization: Bearer <clerk_session_token>
```

前端通过 Clerk `getToken()` 获取 token。

需要在 Clerk 中 **选择组织**（Organization），API 才会返回业务数据。

### 接口列表

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查 |
| GET | `/api/v1/me` | 当前用户 + 组织 |
| GET | `/api/v1/organizations/members` | 组织成员列表 |
| GET | `/api/v1/projects` | 项目列表 |
| POST | `/api/v1/projects` | 创建项目 |
| GET | `/api/v1/projects/:id` | 项目详情 |
| GET | `/api/v1/projects/:id/members` | 项目成员 |
| GET | `/api/v1/projects/:id/tasks` | 项目任务 |
| POST | `/api/v1/projects/:id/tasks` | 创建任务 |
| GET | `/api/v1/projects/:id/stats` | 项目统计 |
| GET | `/api/v1/tasks/my` | 我的任务 |
| GET | `/api/v1/tasks/dashboard` | 工作台统计 |
| GET | `/api/v1/tasks/:id` | 任务详情 |
| PATCH | `/api/v1/tasks/:id` | 更新任务 |
| POST | `/api/v1/tasks/:id/transition` | 状态流转 |
| GET | `/api/v1/tasks/:id/comments` | 任务评论 |
| POST | `/api/v1/tasks/:id/comments` | 添加评论 |
| POST | `/api/webhooks/clerk` | Clerk Webhook |

### 响应格式

```json
{
  "code": 0,
  "data": {},
  "message": "ok"
}
```

### 状态流转规则

```
待办 → 进行中
进行中 → 待办 | 评审中 | 阻塞
评审中 → 进行中 | 已完成
已完成 → 评审中
阻塞 → 待办 | 进行中
```

## Clerk 配置

1. [Clerk Dashboard](https://dashboard.clerk.com) 创建应用
2. 开启 **Organizations**
3. 配置 Webhook（可选）：`user.created`, `organization.created`
4. 前端集成 `@clerk/clerk-react`

## Neon 配置

1. [Neon Console](https://console.neon.tech) 创建项目
2. 复制 Connection String 到 `DATABASE_URL`
3. 确保包含 `?sslmode=require`

## 目录结构

```
backend/
├── prisma/
│   ├── schema.prisma    # 数据模型
│   └── seed.ts          # 种子数据
├── src/
│   ├── routes/          # API 路由
│   ├── services/        # 业务逻辑
│   ├── middleware/      # Clerk 认证
│   └── utils/           # 工具函数
└── .env.example
```

## 与前端对接

前端需要：

1. 安装 `@clerk/clerk-react`
2. 用 `getToken()` 附加到 API 请求
3. 将 `TaskContext` 从 Mock 改为调用本 API

示例：

```typescript
const token = await getToken()
const res = await fetch(`${API_URL}/api/v1/tasks/my`, {
  headers: { Authorization: `Bearer ${token}` },
})
```
