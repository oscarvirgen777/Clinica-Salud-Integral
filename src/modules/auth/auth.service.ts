// bcryptjs: comparación de password contra el hash almacenado.
// Se importa con * as porque bcryptjs exporta funciones nombradas
// (bcrypt.compare, bcrypt.hash) y no un default export.
import * as bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
// Prisma para buscar el usuario en la BD.
import { prisma } from '../../config/prisma'
import { AppError } from '../../errors/AppError'

// Unión de literales: los tres roles del sistema.
// Se usa para tipar el return (aunque en la práctica
// el tipo lo infiere TypeScript desde el schema Prisma).
type Role = 'RECEPCIONISTA' | 'MEDICO' | 'GERENCIA'
/**
 * SERVICE de autenticación: lógica de negocio del login.
 *
 * Separación:
 *   - Controller → HTTP (extrae req.body, responde res.json)
 *   - Service    → Negocio (query BD, bcrypt, jwt.sign)
 *
 * El controller queda:
 *   const result = await authService.login(req.body.email, req.body.password);
 *   res.json(result);
 *
 * Sin try/catch: los AppError suben al error middleware global.
 */
export const authService = {
  
  /**
   * Proceso de login:
   * 1. Busca el usuario por email (@unique en el schema Prisma)
   * 2. Compara el password con bcrypt
   * 3. Firma el JWT con el payload necesario para los middlewares
   * 4. Devuelve token + datos mínimos del usuario
   *
   * @throws AppError(401) si el email no existe o el password no coincide
   */
  async login(email: string, password: string) {
        // Busca por email. Si no existe → user es null.
    const user = await prisma.user.findUnique({ where: { email } })

    // Mensaje genérico (no revela si el email existe o el password es incorrecto)
    // para prevenir user enumeration attack.

    if (!user) throw new AppError('Credenciales inválidas', 401)

    // bcrypt.compare: reconstruye el hash usando el salt embebido
    // en el hash almacenado ($2b$10$...) y lo compara.
    // Es async porque bcrypt es intencionalmente lento (cost factor).
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) throw new AppError('Credenciales inválidas', 401)
// Firma el JWT (HMAC-SHA256).
    //
    // Payload: coincide con la interface AuthPayload de auth.middleware.ts:
    //   id       → identificador del usuario
    //   email    → email del usuario
    //   role     → usado por authorize() para verificar permisos
    //   doctorId → usado por ownDoctorResource/ownAppointment (null para no-médicos)
    //
    // expiresIn: '8h' → cubre un turno de trabajo completo.
    const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role, doctorId: user.doctorId },
      process.env.JWT_SECRET!,
      { expiresIn: '8h' }
    )

    // Devuelve el token + datos mínimos para que el frontend
    // muestre la sesión sin hacer una request extra.
    // No se incluye el password ni el doctorId en el objeto user
    // (no son necesarios por el cliente).
    return { token, user: { id: user.id, name: user.name, role: user.role } }
  },
}   