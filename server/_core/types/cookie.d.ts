/**
 * @archivo server/_core/types/cookie.d.ts
 * @descripcion Infraestructura del servidor: autenticación, contexto, almacenamiento o servicios internos.
 */
declare module "cookie" {
  /**
   * Interpreta y valida la entrada asociada a .
   */
  export function parse(str: string, options?: Record<string, unknown>): Record<string, string>;
}
