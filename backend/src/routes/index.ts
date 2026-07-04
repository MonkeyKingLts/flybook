import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import { projectRouter } from './projects.js'
import { taskRouter } from './tasks.js'
import { getMe } from './me.js'
import { requireAuth, requireOrganization } from '../middleware/auth.js'
import { ForbiddenError } from '../lib/errors.js'

export const apiRouter = Router()

apiRouter.use(requireAuth)

apiRouter.get('/me', getMe)

// 所有业务 API 需要已选择 Clerk 组织
apiRouter.use(requireOrganization)

// 可选：校验 URL 中的 orgId 与当前会话组织一致
apiRouter.use('/organizations/:orgId', validateOrgAccess)

apiRouter.use('/organizations/:orgId/projects', projectRouter)
apiRouter.use('/tasks', taskRouter)

function validateOrgAccess(req: Request, _res: Response, next: NextFunction) {
  const urlOrgId = req.params.orgId
  const sessionOrgId = req.authContext?.organizationId

  // 支持传数据库 org id；若与 session 不一致则拒绝
  if (urlOrgId && sessionOrgId && urlOrgId !== sessionOrgId) {
    return next(new ForbiddenError('无权访问该组织'))
  }
  next()
}
