import type { Request, Response } from 'express'
// bcryptjs: hash de passwords (100% JavaScript, sin compilación nativa).
// Aquí solo se usa bcrypt.compare (el hash se hace al registrar usuarios en el seed).
import bcrypt from 'bcryptjs'
// jsonwebtoken: firma del token JWT.
// Aquí se usa jwt.sign (la verificación la hace auth.middleware.ts).
import jwt from 'jsonwebtoken'
// Prisma para buscar el usuario en la BD.
import { prisma } from '../../config/prisma'


/**
 * POST /api/auth/login
 * Rol: Público (no requiere token).
 *
 * Flujo:
 * 1. Extrae email y password del body
 * 2. Busca el usuario por email (único)
 * 3. Compara el password en plain text contra el hash almacenado
 * 4. Si coincide → firma un JWT con el rol y doctorId
 * 5. Si no → 401 genérico (no revela si el email existe o el password es incorrecto)
 */
export async function login(req: Request, res: Response) {
  try {
     // Destructuración del body.
    // (No se valida con Zod aquí porque son solo 2 campos simples:
    //  si faltan, user será undefined o bcrypt.compare fallará → 401.)
    const { email, password } = req.body
    // Busca el usuario por email (campo @unique en el schema Prisma).
    // Si no existe → user es null.
    const user = await prisma.user.findUnique({ where: { email } })

    // Doble condición con short-circuit:
    //   - !user → el email no existe en la BD
    //   - !(await bcrypt.compare(...)) → el password no coincide con el hash
    //
    // ⚠️ El mensaje es intencionalmente GENÉRICO ("Credenciales inválidas").
    // No dice "Email no registrado" ni "Password incorrecto" porque
    // eso permitiría a un atacante enumerar emails válidos (user enumeration attack).
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

     // Firma el JWT con el payload (lo que viaja dentro del token).
    //
    // Payload:
    //   id       → id del usuario (para referencias futuras)
    //   email    → email del usuario
    //   role     → rol para el middleware authorize
    //   doctorId → FK a doctors (null para recepcionistas/gerencia)
    //
    // Segundo arg: el secreto con el que se firma (HMAC-SHA256).
    // Tercer arg: opciones de expiración (8 horas según el README).
const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role, doctorId: user.doctorId },
  process.env.JWT_SECRET as string,
  { expiresIn: '8h' }
)
 // 200 OK: devuelve solo el token.
    // El cliente lo guarda (localStorage/cookie) y lo envía en
    // Authorization: Bearer <token> en cada request posterior.
    res.json({ token })
  } catch {
     // Catch genérico: cualquier error inesperado (BD caída, timeout, etc.)
    // → 500 sin exponer el stack al cliente.
    //
    // ⚠️ Nota: en un proyecto más grande, este catch sería innecesario
    // porque el error middleware global lo captura. Aquí se deja explícito
    // porque es el único handler del módulo y se quiere un mensaje
    // específico ("Error al iniciar sesión") en vez del genérico del errorHandler.
    res.status(500).json({ message: 'Error al iniciar sesión' })
  }
}