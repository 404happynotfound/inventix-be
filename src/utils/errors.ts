export abstract class AppError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details: any;

  constructor(message: string, status: number, code: string, details: any = []) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request', code: string = 'BAD_REQUEST', details: any = []) {
    super(message, 400, code, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', code: string = 'UNAUTHORIZED', details: any = []) {
    super(message, 401, code, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', code: string = 'FORBIDDEN', details: any = []) {
    super(message, 403, code, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource Not Found', code: string = 'NOT_FOUND', details: any = []) {
    super(message, 404, code, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict', code: string = 'CONFLICT', details: any = []) {
    super(message, 409, code, details);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal Server Error', code: string = 'INTERNAL_ERROR', details: any = []) {
    super(message, 500, code, details);
  }
}
