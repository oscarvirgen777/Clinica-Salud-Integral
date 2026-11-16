import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

/**
 * Estructura del payload dentro del JWT.
 * Se define aquí (no en el módulo auth) porque es el "contrato"
 * que el middleware inyecta en req.user y que el resto de la app consume.
 */
export interface AuthPayload {
  id: number
  email: string
  role: 'RECEPCIONISTA' | 'MEDICO' | 'GERENCIA'
  doctorId?: number | null
}

/**
 * EXTENSIÓN DE TIPOS DE EXPRESS:
 * Añade la propiedad `user` al tipo `Request` global.
 * Sin esto, `req.user` daría error de TypeScript en todo el proyecto.
 * Con esto, cualquier controlador puede usar `req.user!.role`
 * y TypeScript lo autocompleta y valida.
 */declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload
    }
  }
}
/**
 * Middleware de AUTENTICACIÓN.
 * Se monta ANTES de las rutas protegidas en app.ts:
 *   app.use('/api', verifyToken, routes)
 *
 * Flujo:
 * 1. Extrae el header "Authorization"
 * 2. Verifica que exista y tenga el prefijo "Bearer "
 * 3. Extrae el token (la parte después de "Bearer ")
 * 4. Verifica firma + expiración con jwt.verify
 * 5. Si todo OK → inyecta req.user y llama next()
 * 6. Si falla → responde 401 directamente (no pasa a next)
 */
export function verifyToken(req: Request, res: Response, next: NextFunction) {
   // ── Paso 1: Extraer el header ──────────────────────────────────────
  // Devuelve string | string[] | undefined según el header.
  // En la práctica siempre es string | undefined.
  const header = req.headers.authorization
  // ── Paso 2: Validar formato ────────────────────────────────────────
  // Si no hay header O no empieza con "Bearer " → 401 inmediato.
  // El cliente debe enviar: Authorization: Bearer <token>
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' })
  }

  // ── Paso 3: Extraer el token ───────────────────────────────────────
  // "Bearer eyJhbGciOi..." → split(' ') → ["Bearer", "eyJhbGciOi..."]
  // [1] es el token propiamente dicho.
  const token = header.split(' ')[1]

  // Guard extra: teóricamente no debería ser undefined
  // (ya validamos startsWith), pero protege contra edge cases
  // como "Bearer " (con espacio final y nada más).
  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' })
  }
  // ── Paso 4: Verificar firma y expiración ───────────────────────────
  // jwt.verify:
  //   - Descripta el token (base64)
  //   - Verifica que la firma HMAC-SHA256 coincida con JWT_SECRET
  //   - Verifica que el claim "exp" no haya pasado
  //   - Si algo falla → lanza una excepción (JsonWebTokenError, TokenExpiredError)
  //
  // El `as unknown as AuthPayload` es un type assertion doble:
  // jwt.verify devuelve string | { [key: string]: any } | Buffer
  // → cast a unknown → cast a AuthPayload (lo que realmente contiene)
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET as string) as unknown as AuthPayload
        // ── Paso 5: Todo OK → pasar al siguiente middleware/ruta ────────

    next()
  } catch {
      // ── Paso 6: Firma inválida, token expirado, formato corrupto ────
    // Se responde 401 directamente. NO se llama next() ni se lanza
    // el error al error middleware (es un error "esperado" de auth).
    return res.status(401).json({ message: 'Token inválido o expirado' })
  }
}   