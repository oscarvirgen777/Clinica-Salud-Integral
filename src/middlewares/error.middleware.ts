// Tipos de Express. Un error middleware SIEMPRE tiene 4 parámetros
// (err, req, res, next) — Express lo usa para distinguirlo de un
// middleware normal (3 parámetros). Si pones 3, Express NO lo trata
// como error handler y los throws no llegan aquí.
import type { Request, Response, NextFunction } from 'express';
/**
 * TIPO ESTRUCTURAL (duck typing) de error.
 *
 * NO es la misma clase que src/errors/AppError.ts.
 * Es una interface local que dice: "acepto cualquier objeto
 * que tenga .message y opcionalmente .statusCode".
 *
 * Esto significa que el error middleware captura:
 *   - Instancias de la clase AppError (y sus subclases)
 *   - Errores nativos de Node (TypeError, RangeError…)
 *   - Errores de Prisma (PrismaClientKnownRequestError…)
 *   - Errores creados con el helper httpError() de abajo
 *
 * Es intencional: un error middleware debe ser el "último recurso"
 * que captura TODO, no solo errores de una clase específica.
 */
interface AppError extends Error {
  statusCode?: number;
}
/**
 * MIDDLEWARE GLOBAL DE ERRORES.
 *
 * Se monta SIEMPRE al final de la cadena de middlewares en app.ts:
 *   app.use(errorHandler)
 *
 * Cualquier throw (síncrono) o reject (async) que no sea catcheado
 * por un try/catch anterior termina aquí.
 *
 * Flujo:
 * 1. Extrae statusCode (default 500 si no lo tiene)
 * 2. Extrae message (default genérico)
 * 3. Loggea en consola (en prod iría a un logger como pino/winston)
 * 4. Responde JSON con el error
 * 5. En desarrollo incluye el stack trace (para debug); en prod NO
 */
export function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction) {

  // ?? (nullish coalescing): solo aplica el default si es null/undefined.
  // Si err.statusCode es 0 (falso pero no nullish), se mantiene.
  const statusCode = err.statusCode ?? 500;
  const message = err.message ?? 'Error interno del servidor';
 // Log en consola. En producción esto iría a un logger estructurado
  // (pino, winston) con correlación de request id, timestamp, etc.
  console.error(`[ERROR] ${statusCode} - ${message}`);
  // Respuesta JSON al cliente.
  res.status(statusCode).json({
    message,
      // Spread condicional: en dev incluye el stack trace para debug.
    // En prod se omite (no se expone información interna al cliente).
    // Truco: `false && {...}` → false, y spread de false → nada.
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

/**
 * HELPER para lanzar errores con statusCode sin heredar de AppError.
 *
 * Uso:
 *   throw httpError('Email ya registrado', 409);
 *
 * Crea un Error nativo y le "inyecta" la propiedad statusCode.
 * El error middleware lo captura porque cumple con la interface
 * estructural (tiene .message y .statusCode).
 *
 * Diferencia con la clase AppError de src/errors/:
 *   - AppError clase → tiene isOperational, readonly, fix de prototype
 *   - httpError helper → más ligero, sin herencia, para casos simples
 *
 * Ambos son válidos; el helper es más rápido de escribir en un
 * controlador cuando no necesitas la clase completa.
 */
export function httpError(message: string, statusCode: number): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  return error;
}   