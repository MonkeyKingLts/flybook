# Flybook

多租户 SaaS 任务管理系统（飞书任务简化版）。当前仓库只有前端（`frontend/`），后端（FastAPI）尚未开发。

## Cursor Cloud specific instructions

- 目前唯一可运行的服务是 `frontend/`（React 19 + Vite + TypeScript），使用 **npm**（存在 `package-lock.json`）。所有命令都在 `frontend/` 目录下执行。
- 前端使用 **Mock 数据**（`frontend/src/data/mock.ts`），没有后端 API 依赖。登录页 `/login` 已预填凭据，直接点击"登录"即可进入工作台；新建的任务只保存在前端内存中（刷新后丢失）。
- 常用命令见 `frontend/package.json` scripts：`npm run dev`（开发服务器，端口 5173）、`npm run build`（`tsc -b && vite build`）、`npm run lint`（oxlint）。
- `npm run lint` 目前会输出若干 `react(only-export-components)` 警告，这是预期的、非阻塞的（退出码为 0）。
