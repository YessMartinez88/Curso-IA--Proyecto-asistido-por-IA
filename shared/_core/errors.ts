/**
 * @archivo shared/_core/errors.ts
 * @descripcion Tipos o errores compartidos de infraestructura entre cliente y servidor.
 */
/**
 * Base HTTP error class with status code.
 * Throw this from route handlers to send specific HTTP errors.
 */
export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

// Convenience constructors
/**
 * Implementa la operación BadRequestError dentro de este módulo.
 */
export const BadRequestError = (msg: string) => new HttpError(400, msg);
/**
 * Implementa la operación UnauthorizedError dentro de este módulo.
 */
export const UnauthorizedError = (msg: string) => new HttpError(401, msg);
/**
 * Implementa la operación ForbiddenError dentro de este módulo.
 */
export const ForbiddenError = (msg: string) => new HttpError(403, msg);
/**
 * Implementa la operación NotFoundError dentro de este módulo.
 */
export const NotFoundError = (msg: string) => new HttpError(404, msg);
