export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code = statusCode,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = '未授权') {
    super(401, message, 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = '无权限') {
    super(403, message, 403)
  }
}

export class NotFoundError extends AppError {
  constructor(message = '资源不存在') {
    super(404, message, 404)
  }
}

export class BadRequestError extends AppError {
  constructor(message = '请求参数错误') {
    super(400, message, 400)
  }
}
