import { Router } from 'express'
import { z } from 'zod'
import { BadRequestError } from '../lib/errors.js'
import { requireOrganization } from '../middleware/auth.js'
import { ok } from '../utils/response.js'
import { param } from '../utils/params.js'
import { formatTask } from '../utils/serializers.js'
import * as taskService from '../services/task.service.js'

const router = Router()

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  assigneeId: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
})

const transitionSchema = z.object({
  toStatus: z.enum(['todo', 'in_progress', 'in_review', 'done', 'blocked']),
})

const commentSchema = z.object({
  content: z.string().min(1).max(2000),
})

router.get('/my', requireOrganization, async (req, res, next) => {
  try {
    const tasks = await taskService.listMyTasks(
      req.authContext!.user.id,
      req.authContext!.organizationId!,
    )
    ok(res, tasks.map((task) => formatTask(task)))
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
    ok(res, stats)
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
    ok(res, formatTask(task))
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
