import type { Request, Response } from 'express'
import { ok } from '../utils/response.js'
import { formatUser } from '../utils/serializers.js'

export function getMe(req: Request, res: Response) {
  const { user, organizationId, orgRole } = req.authContext!
  return ok(res, {
    user: formatUser(user),
    organizationId,
    orgRole,
  })
}
