import { Router } from 'express'
import { z } from 'zod'
import { BadRequestError } from '../lib/errors.js'
import { requireOrganization } from '../middleware/auth.js'
import { ok } from '../utils/response.js'
import { param } from '../utils/params.js'
import { formatProject, formatTask } from '../utils/serializers.js'
import * as projectService from '../services/project.service.js'
import * as taskService from '../services/task.service.js'

const router = Router()

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  key: z.string().min(2).max(5),
  description: z.string().max(500).optional(),
})

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(['todo', 'in_progress', 'in_review', 'done', 'blocked']).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
})

router.get('/', requireOrganization, async (req, res, next) => {
  try {
    const projects = await projectService.listProjects(req.authContext!.organizationId!)
    ok(res, projects.map(formatProject))
  } catch (error) {
    next(error)
  }
})

router.post('/', requireOrganization, async (req, res, next) => {
  try {
    const parsed = createProjectSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? '参数错误')
    }

    const project = await projectService.createProject(
      req.authContext!.organizationId!,
      req.authContext!.user.id,
      parsed.data,
    )
    ok(res, formatProject(project), '创建成功')
  } catch (error) {
    next(error)
  }
})

router.get('/:projectId', requireOrganization, async (req, res, next) => {
  try {
    const project = await projectService.getProject(
      param(req, 'projectId'),
      req.authContext!.organizationId!,
    )
    ok(res, formatProject(project))
  } catch (error) {
    next(error)
  }
})

router.get('/:projectId/members', requireOrganization, async (req, res, next) => {
  try {
    const members = await projectService.listProjectMembers(
      param(req, 'projectId'),
      req.authContext!.organizationId!,
    )
    ok(res, members)
  } catch (error) {
    next(error)
  }
})

router.get('/:projectId/tasks', requireOrganization, async (req, res, next) => {
  try {
    const tasks = await taskService.listProjectTasks(
      param(req, 'projectId'),
      req.authContext!.organizationId!,
    )
    ok(res, tasks.map((task) => formatTask(task)))
  } catch (error) {
    next(error)
  }
})

router.post('/:projectId/tasks', requireOrganization, async (req, res, next) => {
  try {
    const parsed = createTaskSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? '参数错误')
    }

    const task = await taskService.createTask({
      organizationId: req.authContext!.organizationId!,
      projectId: param(req, 'projectId'),
      userId: req.authContext!.user.id,
      ...parsed.data,
    })
    ok(res, formatTask(task), '创建成功')
  } catch (error) {
    next(error)
  }
})

router.get('/:projectId/stats', requireOrganization, async (req, res, next) => {
  try {
    const stats = await projectService.getProjectStats(
      param(req, 'projectId'),
      req.authContext!.organizationId!,
    )
    ok(res, stats)
  } catch (error) {
    next(error)
  }
})

export default router
