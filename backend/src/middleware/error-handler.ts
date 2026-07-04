import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { AppError } from '../lib/errors.js'
import { fail } from '../utils/response.js'

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return fail(res, err.statusCode, err.message)
  }

  if (err instanceof ZodError) {
    const message = err.issues.map((issue) => issue.message).join('; ')
    return fail(res, 400, message || '请求参数错误')
  }

  console.error(err)
  return fail(res, 500, '服务器内部错误')
}
