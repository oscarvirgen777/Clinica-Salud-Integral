import { AppError } from './AppError'

/**
 * Error para cuando falta autenticación o el token es inválido/expirado.
 * Se lanza desde el middleware auth.middleware.ts cuando:
 *   - No hay header "Authorization"
 *   - El token no tiene el prefijo "Bearer "
 *   - jwt.verify falla (firma inválida o token expirado)
 *
 * Respuesta del error middleware:
 *   { "message": "No autenticado" }  → 401
 */
export class UnauthorizedError extends AppError {
   // Mensaje con default para el caso más común (token ausente/expirado).
    // Se puede sobreescribir para casos específicos:
    //   new UnauthorizedError('Token expirado')
    //   new UnauthorizedError('Token inválido')
  constructor(message: string = 'No autenticado') {

        // statusCode 401 (Unauthorized)
    // isOperational → true (por default, es un error esperado)
    super(message, 401)
  }
}   