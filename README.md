# Flybook

多租户 SaaS 任务管理系统（飞书任务简化版）

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 19 + TypeScript + Vite |
| 样式 | Tailwind CSS v4 |
| 组件 | shadcn/ui |
| 路由 | React Router v7 |
| 数据 | TanStack Query（已接入，待连 API） |
| 后端 | FastAPI + SQLite（待开发） |

## 项目结构

```
flybook/
├── frontend/          # React 前端
├── DESIGN.md          # 设计规范（飞书风）
└── README.md
```

## 快速开始

### 前端

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:5173

- 登录页：`/login`（点击登录进入工作台）
- 看板页：`/projects/1/board`

### 页面路由

| 页面 | 路由 |
|------|------|
| 登录 | `/login` |
| 注册 | `/register` |
| 工作台 | `/dashboard` |
| 我的任务 | `/my-tasks` |
| 项目列表 | `/projects` |
| 看板 | `/projects/:id/board` |
| 列表 | `/projects/:id/list` |
| 统计 | `/projects/:id/stats` |
| 项目设置 | `/projects/:id/settings` |
| 组织设置 | `/org/settings` |

## 开发说明

- 当前前端使用 **Mock 数据**（`frontend/src/data/mock.ts`）
- 设计规范见 [DESIGN.md](./DESIGN.md)
- 后端 API 就绪后，在 `frontend/src/api/` 对接真实接口

## 分工

- **前端**：你负责页面、交互、组件
- **后端**：FastAPI 骨架 + API（我来搭建）
