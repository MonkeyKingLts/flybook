import { Router } from 'express'
import type { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { ok } from '../utils/response.js'
import { formatProject } from '../utils/serializers.js'
import { createProject, getProject, getProjectStats, listProjects } from '../services/project.service.js'
import { createTask, listProjectTasks } from '../services/task.service.js'
import { formatTask } from '../utils/serializers.js'
import { z } from 'zod'
import { param } from '../utils/params.js'

export const projectRouter = Router({ mergeParams: true })

projectRouter.get('/', async (req: Request, res: Response) => {
  const orgId = req.authContext!.organizationId!
  const projects = await listProjects(orgId)
  return ok(res, { items: projects.map(formatProject) })
})

projectRouter.post('/', async (req: Request, res: Response) => {
  const orgId = req.authContext!.organizationId!
  const userId = req.authContext!.user.id

  const body = z
    .object({
      name: z.string().min(1),
      key: z.string().min(2).max(5),
      description: z.string().optional(),
    })
    .parse(req.body)

  const project = await createProject(orgId, userId, body)
  return ok(res, formatProject(project), '项目已创建')
})

projectRouter.get('/:projectId', async (req: Request, res: Response) => {
  const orgId = req.authContext!.organizationId!
  const project = await getProject(param(req, 'projectId'), orgId)
  return ok(res, formatProject(project))
})

projectRouter.get('/:projectId/tasks', async (req: Request, res: Response) => {
  const orgId = req.authContext!.organizationId!
  const tasks = await listProjectTasks(param(req, 'projectId'), orgId)
  return ok(res, { items: tasks.map((t) => formatTask(t)) })
})

projectRouter.post('/:projectId/tasks', async (req: Request, res: Response) => {
  const orgId = req.authContext!.organizationId!
  const userId = req.authContext!.user.id
  const projectId = param(req, 'projectId')

  const body = z
    .object({
      title: z.string().min(1),
      description: z.string().optional(),
      status: z.string().optional(),
      priority: z.string().optional(),
      assigneeId: z.string().optional(),
      dueDate: z.string().optional(),
    })
    .parse(req.body)

  const task = await createTask({
    organizationId: orgId,
    projectId,
    userId,
    ...body,
  })

  return ok(res, formatTask(task), '任务已创建')
})

projectRouter.get('/:projectId/stats', async (req: Request, res: Response) => {
  const orgId = req.authContext!.organizationId!
  const stats = await getProjectStats(param(req, 'projectId'), orgId)
  return ok(res, stats)
})

projectRouter.get('/:projectId/members', async (req: Request, res: Response) => {
  const orgId = req.authContext!.organizationId!
  const projectId = param(req, 'projectId')
  const members = await prisma.projectMember.findMany({
    where: { project: { id: projectId, organizationId: orgId } },
    include: { user: true },
  })
  return ok(res, {
    items: members.map((m) => ({
      ...m,
      user: { id: m.user.id, name: m.user.name, email: m.user.email },
    })),
  })
})
