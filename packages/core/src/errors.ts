export class AppError extends Error {
  public readonly code: string;
  public statusCode: number;
  public readonly context?: Record<string, unknown>;

  constructor(message: string, code = "INTERNAL_ERROR", statusCode = 500, context?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
    // Restore prototype chain for instance checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class RetryableError extends AppError {
  constructor(message: string, code = "TRANSIENT_ERROR", context?: Record<string, unknown>) {
    super(message, code, 503, context);
  }
}

export class FatalError extends AppError {
  constructor(message: string, code = "FATAL_ERROR", context?: Record<string, unknown>) {
    super(message, code, 400, context);
  }
}

export class RateLimitError extends RetryableError {
  public readonly retryAfterMs: number;

  constructor(message: string, retryAfterMs: number, context?: Record<string, unknown>) {
    super(message, "RATE_LIMIT_EXCEEDED", context);
    this.retryAfterMs = retryAfterMs;
    this.statusCode = 429;
  }
}

export class NotFoundError extends FatalError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "NOT_FOUND", context);
    this.statusCode = 404;
  }
}

export class ValidationError extends FatalError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", context);
    this.statusCode = 400;
  }
}
