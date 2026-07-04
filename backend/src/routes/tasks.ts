import { Router } from 'express'
import type { Request, Response } from 'express'
import { z } from 'zod'
import {
  getTaskById,
  listMyTasks,
  transitionTask,
  updateTask,
} from '../services/task.service.js'
import { getDashboardStats } from '../services/task.service.js'
import { ok } from '../utils/response.js'
import { formatTask } from '../utils/serializers.js'
import { param } from '../utils/params.js'

export const taskRouter = Router()

taskRouter.get('/my', async (req: Request, res: Response) => {
  const orgId = req.authContext!.organizationId!
  const userId = req.authContext!.user.id
  const tasks = await listMyTasks(userId, orgId)
  return ok(res, { items: tasks.map((t) => formatTask(t)) })
})

taskRouter.get('/dashboard', async (req: Request, res: Response) => {
  const orgId = req.authContext!.organizationId!
  const userId = req.authContext!.user.id
  const stats = await getDashboardStats(orgId, userId)
  return ok(res, stats)
})

taskRouter.get('/:taskId', async (req: Request, res: Response) => {
  const orgId = req.authContext!.organizationId!
  const task = await getTaskById(param(req, 'taskId'), orgId)
  return ok(res, {
    ...formatTask(task),
    comments: task.comments.map((c) => ({
      id: c.id,
      content: c.content,
      author: { id: c.author.id, name: c.author.name },
      createdAt: c.createdAt,
    })),
    history: task.history.map((h) => ({
      id: h.id,
      fromStatus: h.fromStatus,
      toStatus: h.toStatus,
      changedBy: h.changedBy.name,
      createdAt: h.createdAt,
    })),
  })
})

taskRouter.patch('/:taskId', async (req: Request, res: Response) => {
  const orgId = req.authContext!.organizationId!
  const userId = req.authContext!.user.id

  const body = z
    .object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      priority: z.string().optional(),
      assigneeId: z.string().nullable().optional(),
      dueDate: z.string().nullable().optional(),
    })
    .parse(req.body)

  const task = await updateTask(param(req, 'taskId'), orgId, userId, body)
  return ok(res, formatTask(task), '任务已更新')
})

taskRouter.post('/:taskId/transition', async (req: Request, res: Response) => {
  const orgId = req.authContext!.organizationId!
  const userId = req.authContext!.user.id

  const body = z.object({ status: z.string().min(1) }).parse(req.body)
  const task = await transitionTask(param(req, 'taskId'), orgId, userId, body.status)
  return ok(res, formatTask(task), '状态已更新')
})
