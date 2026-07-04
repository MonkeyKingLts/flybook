import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { getMe } from './me.js'
import organizationsRouter from './organizations.js'
import projectsRouter from './projects.js'
import tasksRouter from './tasks.js'

const router = Router()

router.use(requireAuth)

router.get('/me', getMe)
router.use('/organizations', organizationsRouter)
router.use('/projects', projectsRouter)
router.use('/tasks', tasksRouter)

export const apiRouter = router
