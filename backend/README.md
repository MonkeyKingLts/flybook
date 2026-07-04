# Flybook Backend API

基于 **Express + Prisma + Neon PostgreSQL + Clerk** 的多租户任务管理后端。

## 架构说明

```
Clerk（用户 / 组织认证）
        ↓ Bearer Token
Express API（业务逻辑）
        ↓ Prisma ORM
Neon PostgreSQL（业务数据）
```

- **Clerk** 负责：登录、注册、组织切换、用户资料
- **Neon** 负责：项目、任务、评论、成员关系等业务数据
- 首次请求时自动将 Clerk User/Org 同步到 Neon（`requireAuth` 中间件）

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

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | Neon 连接串（含 `?sslmode=require`） |
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
# 或 npm run db:push  # 快速原型
npm run db:seed      # 填充演示数据（可选）
```

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

前端通过 Clerk `getToken()` 获取 token。需要在 Clerk 中**选择组织**，业务 API 才会返回数据。

### 接口列表

#### 用户

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查 |
| GET | `/api/v1/me` | 当前用户 + 组织 |

#### 组织

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/organizations/members` | 组织成员（支持 `?search=`） |

#### 项目

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/projects` | 项目列表 |
| POST | `/api/v1/projects` | 创建项目 |
| GET | `/api/v1/projects/:id` | 项目详情 |
| PATCH | `/api/v1/projects/:id` | 更新项目 |
| DELETE | `/api/v1/projects/:id` | 删除项目 |
| GET | `/api/v1/projects/:id/members` | 项目成员 |
| GET | `/api/v1/projects/:id/tasks` | 项目任务（支持筛选） |
| POST | `/api/v1/projects/:id/tasks` | 创建任务 |
| GET | `/api/v1/projects/:id/stats` | 项目统计 |

#### 任务

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/tasks/my` | 我的任务（分页 + 筛选） |
| GET | `/api/v1/tasks/dashboard` | 工作台统计 |
| GET | `/api/v1/tasks/:id` | 任务详情（含活动 + 评论） |
| PATCH | `/api/v1/tasks/:id` | 更新任务 |
| POST | `/api/v1/tasks/:id/transition` | 状态流转 |
| GET | `/api/v1/tasks/:id/comments` | 任务评论 |
| POST | `/api/v1/tasks/:id/comments` | 添加评论 |
| PATCH | `/api/v1/tasks/batch` | 批量更新 |
| POST | `/api/v1/tasks/batch-delete` | 批量删除 |

### 查询参数（任务列表）

| 参数 | 说明 |
|------|------|
| `status` | `todo` / `in_progress` / `in_review` / `done` / `blocked` |
| `priority` | `high` / `medium` / `low` |
| `projectId` | 按项目筛选 |
| `assigneeId` | 按负责人筛选 |
| `search` | 标题/描述搜索 |
| `overdue` | `true` 仅逾期任务 |
| `page` | 页码，默认 1 |
| `pageSize` | 每页条数，默认 20 |

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

## 数据模型

| 模型 | 说明 |
|------|------|
| User | 本地用户（`clerkId` 关联 Clerk） |
| Organization | 组织（`clerkOrgId` 关联 Clerk） |
| OrganizationMember | 组织成员 + 角色 |
| Project | 项目（含 `color` 主题色） |
| ProjectMember | 项目成员 + 角色 |
| Task | 任务（含 `tags`、`completedAt`、状态流转） |
| TaskComment | 任务评论 |
| TaskStatusHistory | 活动记录（状态变更） |

## Clerk 配置

1. [Clerk Dashboard](https://dashboard.clerk.com) 创建应用
2. 开启 **Organizations**
3. 添加 `http://localhost:5173` 到 Allowed origins
4. 配置 Webhook（可选）：`user.created`, `organization.created`

## Neon 配置

1. [Neon Console](https://console.neon.tech) 创建项目
2. 复制 Connection String 到 `DATABASE_URL`
3. 确保包含 `?sslmode=require`

## 目录结构

```
backend/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── src/
│   ├── routes/          # API 路由
│   ├── services/        # 业务逻辑
│   ├── middleware/      # Clerk 认证
│   └── utils/           # 序列化、日期、查询
└── .env.example
```
