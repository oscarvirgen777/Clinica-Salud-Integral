import { z } from 'zod';
/**
 * Schema para POST /api/auth/login (body).
 *
 * Valida la forma de los datos de login:
 *   - email: debe ser un string con formato de email válido
 *   - password: debe ser un string de mínimo 6 caracteres
 *
 * Se usa en auth.routes.ts con el middleware validate:
 *   router.post('/login', validate(loginSchema), login)
 */
export const loginSchema = z.object({
    // .email(): valida que el string tenga formato de email (contiene @, dominio, etc.).
  // No verifica que el email EXISTA en la BD (eso lo hace el service con prisma.findUnique).
  email: z.string().email(),
  
  // .min(6): el password debe tener al menos 6 caracteres.
  // (La política real de la BD/seed puede ser más estricta,
  //  pero aquí se valida el mínimo aceptable en la API.)
  password: z.string().min(6),
});   