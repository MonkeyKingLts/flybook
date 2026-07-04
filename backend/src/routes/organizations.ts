import { Router } from 'express'
import { requireOrganization } from '../middleware/auth.js'
import { ok } from '../utils/response.js'
import { parseSearchQuery } from '../utils/query.js'
import * as orgService from '../services/organization.service.js'

const router = Router()

router.get('/members', requireOrganization, async (req, res, next) => {
  try {
    const members = await orgService.listMembers(
      req.authContext!.organizationId!,
      parseSearchQuery(req),
    )
    ok(res, members)
  } catch (error) {
    next(error)
  }
})

export default router
