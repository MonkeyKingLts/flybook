import { Router } from 'express'
import type { Request, Response } from 'express'
import { Webhook } from 'svix'
import { prisma } from '../lib/prisma.js'
import { ok } from '../utils/response.js'

export const webhookRouter = Router()

webhookRouter.post('/clerk', async (req: Request, res: Response) => {
  const secret = process.env.CLERK_WEBHOOK_SECRET
  if (!secret) {
    return res.status(500).json({ error: 'Webhook secret not configured' })
  }

  const svixId = req.headers['svix-id'] as string
  const svixTimestamp = req.headers['svix-timestamp'] as string
  const svixSignature = req.headers['svix-signature'] as string

  const wh = new Webhook(secret)
  let event: { type: string; data: Record<string, unknown> }

  try {
    event = wh.verify(JSON.stringify(req.body), {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as { type: string; data: Record<string, unknown> }
  } catch {
    return res.status(400).json({ error: 'Invalid webhook signature' })
  }

  switch (event.type) {
    case 'user.created':
    case 'user.updated': {
      const data = event.data as {
        id: string
        email_addresses?: { email_address: string }[]
        first_name?: string
        last_name?: string
        image_url?: string
      }
      const email = data.email_addresses?.[0]?.email_address ?? ''
      const name = [data.first_name, data.last_name].filter(Boolean).join(' ') || email

      await prisma.user.upsert({
        where: { clerkId: data.id },
        create: { clerkId: data.id, email, name, avatarUrl: data.image_url },
        update: { email, name, avatarUrl: data.image_url },
      })
      break
    }
    case 'organization.created':
    case 'organization.updated': {
      const data = event.data as { id: string; name: string; slug?: string }
      const slug = data.slug ?? `org-${data.id.slice(-6)}`
      await prisma.organization.upsert({
        where: { clerkOrgId: data.id },
        create: { clerkOrgId: data.id, name: data.name, slug },
        update: { name: data.name },
      })
      break
    }
    default:
      break
  }

  return ok(res, { received: true })
})
