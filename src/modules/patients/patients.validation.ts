import { z } from 'zod';
/**
 * Schema para POST /api/patients (body) y PUT /api/patients/:id (con .partial()).
 *
 * Valida la forma de los datos del paciente:
 *   - name: no vacío
 *   - email: formato válido
 *   - phone: mínimo 7 caracteres
 *   - dateOfBirth: formato YYYY-MM-DD Y no en el futuro
 */
export const createPatientSchema = z.object({
    // .min(1): al menos 1 carácter (evita strings vacías "").
  // El segundo arg es el mensaje de error personalizado
  // (por defecto sería "String must contain at least 1 character(s)").
  name: z.string().min(1, 'El nombre es obligatorio'),
  // .email(): valida formato de email (contiene @, dominio, etc.).
  // Mensaje personalizado si el formato es inválido.
  email: z.string().email('Correo electrónico inválido'),
  // .min(7): el teléfono debe tener al menos 7 dígitos/caracteres.
  // (No valida que sean solo números; eso se haría con .regex() si se quisiera.)
  phone: z.string().min(7, 'Teléfono demasiado corto'),
   // Fecha de nacimiento: dos capas de validación encadenadas.
  //
  // 1° capa: .regex(/^\d{4}-\d{2}-\d{2}$/)
  //    - Valida el FORMATO: exactamente 4 dígitos + guion + 2 dígitos + guion + 2 dígitos.
  //    - Ej: "1985-03-15" ✅ | "15/03/1985" ❌ | "2025-13-45" ✅ (formato OK, pero mes 13 no existe)
  //    - El regex NO valida que sea una fecha real, solo el patrón de caracteres.
  //
  // 2° capa: .refine((val) => new Date(val) < new Date())
  //    - Valida la SEMÁNTICA: la fecha debe ser ANTERIOR a hoy.
  //    - new Date(val) → parsea "1985-03-15" a un objeto Date.
  //    - new Date() → el momento actual.
  //    - Si la fecha de nacimiento es futura → falla con el mensaje indicado.
  //    - Esto cubre el caso "2025-13-45" (el regex lo deja pasar,
  //      pero new Date("2025-13-45") → Invalid Date → NaN < Date → false → falla).
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido (usa YYYY-MM-DD)')
    .refine((val) => new Date(val) < new Date(), {
      message: 'La fecha de nacimiento no puede estar en el futuro',
    }),
});

// z.infer: extrae el tipo TypeScript del schema automáticamente.
// Resultado: { name: string; email: string; phone: string; dateOfBirth: string }
// Se usa en patients.service.ts para tipar el parámetro de create().
// También se usa con .partial() en el controller de update():
//   createPatientSchema.partial() → { name?: string; email?: string; ... }
export type CreatePatientInput = z.infer<typeof createPatientSchema>;   