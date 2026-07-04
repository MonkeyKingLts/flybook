import type { Response } from 'express'

export function ok<T>(res: Response, data: T, message = 'ok') {
  return res.json({ code: 0, data, message })
}

export function fail(res: Response, code: number, message: string) {
  return res.status(code >= 400 ? code : 400).json({ code, data: null, message })
}
