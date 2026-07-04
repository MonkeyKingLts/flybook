import { Router } from 'express'
import { z } from 'zod'
import { BadRequestError } from '../lib/errors.js'
import { requireOrganization } from '../middleware/auth.js'
import { ok } from '../utils/response.js'
import { param } from '../utils/params.js'
import { parseSearchQuery, parseTaskListQuery } from '../utils/query.js'
import { formatPaginated, formatTask, formatTaskDetail } from '../utils/serializers.js'
import * as taskService from '../services/task.service.js'

const router = Router()

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  assigneeId: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  tags: z.array(z.string().max(20)).max(10).optional(),
})

const transitionSchema = z.object({
  toStatus: z.enum(['todo', 'in_progress', 'in_review', 'done', 'blocked']),
})

const commentSchema = z.object({
  content: z.string().min(1).max(2000),
})

const batchUpdateSchema = z.object({
  taskIds: z.array(z.string().min(1)).min(1).max(50),
  status: z.enum(['todo', 'in_progress', 'in_review', 'done', 'blocked']).optional(),
  assigneeId: z.string().nullable().optional(),
})

const batchDeleteSchema = z.object({
  taskIds: z.array(z.string().min(1)).min(1).max(50),
})

router.get('/my', requireOrganization, async (req, res, next) => {
  try {
    const query = parseTaskListQuery(req)
    const { tasks, total } = await taskService.listMyTasks(
      req.authContext!.user.id,
      req.authContext!.organizationId!,
      query,
    )
    ok(
      res,
      formatPaginated(
        tasks.map((task) => formatTask(task)),
        total,
        query.page,
        query.pageSize,
      ),
    )
  } catch (error) {
    next(error)
  }
})

router.get('/dashboard', requireOrganization, async (req, res, next) => {
  try {
    const stats = await taskService.getDashboardStats(
      req.authContext!.organizationId!,
      req.authContext!.user.id,
    )
    ok(res, {
      ...stats,
      myTodos: stats.myTodos.map((task) => formatTask(task)),
    })
  } catch (error) {
    next(error)
  }
})

router.patch('/batch', requireOrganization, async (req, res, next) => {
  try {
    const parsed = batchUpdateSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? '参数错误')
    }

    const tasks = await taskService.batchUpdateTasks(
      req.authContext!.organizationId!,
      req.authContext!.user.id,
      parsed.data,
    )
    ok(res, tasks.map((task) => formatTask(task)), '批量更新成功')
  } catch (error) {
    next(error)
  }
})

router.post('/batch-delete', requireOrganization, async (req, res, next) => {
  try {
    const parsed = batchDeleteSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? '参数错误')
    }

    const result = await taskService.batchDeleteTasks(
      req.authContext!.organizationId!,
      parsed.data.taskIds,
    )
    ok(res, result, '删除成功')
  } catch (error) {
    next(error)
  }
})

router.get('/:taskId', requireOrganization, async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(
      param(req, 'taskId'),
      req.authContext!.organizationId!,
    )
    ok(res, formatTaskDetail(task))
  } catch (error) {
    next(error)
  }
})

router.patch('/:taskId', requireOrganization, async (req, res, next) => {
  try {
    const parsed = updateTaskSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? '参数错误')
    }

    const task = await taskService.updateTask(
      param(req, 'taskId'),
      req.authContext!.organizationId!,
      req.authContext!.user.id,
      parsed.data,
    )
    ok(res, formatTask(task), '更新成功')
  } catch (error) {
    next(error)
  }
})

router.post('/:taskId/transition', requireOrganization, async (req, res, next) => {
  try {
    const parsed = transitionSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? '参数错误')
    }

    const task = await taskService.transitionTask(
      param(req, 'taskId'),
      req.authContext!.organizationId!,
      req.authContext!.user.id,
      parsed.data.toStatus,
    )
    ok(res, formatTask(task), '状态已更新')
  } catch (error) {
    next(error)
  }
})

router.get('/:taskId/comments', requireOrganization, async (req, res, next) => {
  try {
    const comments = await taskService.listComments(
      param(req, 'taskId'),
      req.authContext!.organizationId!,
    )
    ok(res, comments)
  } catch (error) {
    next(error)
  }
})

router.post('/:taskId/comments', requireOrganization, async (req, res, next) => {
  try {
    const parsed = commentSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? '参数错误')
    }

    const comment = await taskService.createComment(
      param(req, 'taskId'),
      req.authContext!.organizationId!,
      req.authContext!.user.id,
      parsed.data.content,
    )
    ok(res, comment, '评论已添加')
  } catch (error) {
    next(error)
  }
})

export default router
