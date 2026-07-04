import { clerkClient, getAuth } from '@clerk/express'
import type { NextFunction, Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { UnauthorizedError } from '../lib/errors.js'
import type { OrgRole, User } from '@prisma/client'

export interface AuthContext {
  clerkUserId: string
  clerkOrgId: string | null
  user: User
  organizationId: string | null
  orgRole: OrgRole | null
}

declare global {
  namespace Express {
    interface Request {
      authContext?: AuthContext
    }
  }
}

function mapClerkOrgRole(role: string | undefined): OrgRole {
  switch (role) {
    case 'org:admin':
      return 'ADMIN'
    case 'org:member':
      return 'MEMBER'
    default:
      return 'MEMBER'
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const { isAuthenticated, userId, orgId, orgRole } = getAuth(req)

    if (!isAuthenticated || !userId) {
      throw new UnauthorizedError()
    }

    const clerkUser = await clerkClient.users.getUser(userId)
    const email = clerkUser.emailAddresses[0]?.emailAddress ?? ''
    const name =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
      clerkUser.username ||
      email.split('@')[0] ||
      '用户'

    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      create: {
        clerkId: userId,
        email,
        name,
        avatarUrl: clerkUser.imageUrl,
      },
      update: {
        email,
        name,
        avatarUrl: clerkUser.imageUrl,
      },
    })

    let organizationId: string | null = null
    let mappedOrgRole: OrgRole | null = null

    if (orgId) {
      const clerkOrg = await clerkClient.organizations.getOrganization({
        organizationId: orgId,
      })

      const slug =
        clerkOrg.slug ??
        clerkOrg.name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')

      const organization = await prisma.organization.upsert({
        where: { clerkOrgId: orgId },
        create: {
          clerkOrgId: orgId,
          name: clerkOrg.name,
          slug: `${slug}-${orgId.slice(-6)}`,
        },
        update: {
          name: clerkOrg.name,
        },
      })

      organizationId = organization.id
      mappedOrgRole = mapClerkOrgRole(orgRole ?? undefined)

      await prisma.organizationMember.upsert({
        where: {
          organizationId_userId: {
            organizationId: organization.id,
            userId: user.id,
          },
        },
        create: {
          organizationId: organization.id,
          userId: user.id,
          role: mappedOrgRole,
        },
        update: {
          role: mappedOrgRole,
        },
      })
    }

    req.authContext = {
      clerkUserId: userId,
      clerkOrgId: orgId ?? null,
      user,
      organizationId,
      orgRole: mappedOrgRole,
    }

    next()
  } catch (error) {
    next(error)
  }
}

export function requireOrganization(req: Request, _res: Response, next: NextFunction) {
  if (!req.authContext?.organizationId) {
    return next(new UnauthorizedError('请先选择组织'))
  }
  next()
}
