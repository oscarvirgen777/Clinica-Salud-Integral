import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../config/prisma'
import { AppError } from '../../errors/AppError'


/**
 * MODEL de autenticación: contiene la lógica de negocio del login.
 *
 * Separación:
 *   - Controller → HTTP (extrae req.body, responde res.json)
 *   - Model      → Negocio (query a BD, bcrypt, jwt.sign)
 *
 * El controller queda así:
 *   const result = await authModel.login(req.body.email, req.body.password);
 *   res.json(result);
 *
 * Y NO necesita try/catch: los AppError lanzados aquí
 * suben al error middleware global (401) o al catch genérico (500).
 */
export const authModel = {
  
  /**
   * Proceso de login:
   * 1. Busca el usuario por email
   * 2. Compara el password con bcrypt
   * 3. Firma el JWT
   * 4. Devuelve token + datos mínimos del usuario
   *
   * @throws AppError(401) si el email no existe o el password no coincide
   * @throws Error(500) si falla la BD (capturado por el error middleware)
   */
  async login(email: string, password: string) {
     // Busca por email (campo @unique en el schema Prisma).
    // Si no existe → user es null → 401.
    const user = await prisma.user.findUnique({ where: { email } })
     // Mensaje genérico (no dice "email no encontrado" ni "password incorrecto")
    // para evitar user enumeration.
    if (!user) throw new AppError('Credenciales inválidas', 401)
  // bcrypt.compare: reconstruye el hash con el salt embebido
    // y lo compara con el hash almacenado. Devuelve true/false.
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) throw new AppError('Credenciales inválidas', 401)
       // Firma el JWT.
    // Payload: solo lo que los middlewares necesitan (id, role).
    // Nota: aquí NO incluye doctorId ni email (a diferencia del controller anterior).
    // Si los middlewares ownDoctorResource/ownAppointment necesitan doctorId,
    // hay que agregarlo al payload.

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, doctorId: user.doctorId },
      process.env.JWT_SECRET!,
      { expiresIn: '8h' }
    )

    // Devuelve el token + datos mínimos del usuario.
    // El controller responde con esto directamente.
    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    }
  },
}   