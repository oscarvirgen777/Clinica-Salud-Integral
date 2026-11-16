// Zod: librería de validación type-safe.
// Los schemas se definen aquí y se usan en:
//   - El middleware validate() (en routes.ts) para validar el request
//   - z.infer<> para extraer el tipo TypeScript del schema
import { z } from 'zod'
/**
 * Schema para POST /api/appointments (body).
 *
 * Valida la FORMA de los datos (tipos, rangos, formato).
 * La regla de negocio de "fecha no pasada" también va aquí
 * porque Zod permite .refine() (validación semántica).
 */
export const createAppointmentSchema = z.object({
   // Id del paciente: entero positivo (>= 1).
  // .int() → no acepta decimales (42.5 falla)
  // .positive() → no acepta 0 ni negativos
  patientId: z.number().int().positive(),
    // Id del médico: mismo criterio.
  doctorId: z.number().int().positive(),
  
  // Fecha de la cita como string (formato ISO: "2026-11-20T10:00:00.000Z").
  // .refine(): validación CUSTOM (no viene en los métodos estándar de Zod).
  //   - new Date(val) → parsea el string a Date
  //   - isNaN(d.getTime()) → true si el string NO es una fecha válida
  //   - d > new Date() → true si la fecha es FUTURA (no pasada ni "ahora")
  // Si alguna condición falla → el error muestra el message indicado.
  //
  // ⚠️ Esto significa que la regla "no agendar en fecha pasada"
  // YA está implementada aquí (en Zod), no en el service.
  // El service no necesita re-verificarla.
  date: z.string().refine((val) => {
    const d = new Date(val)
    return !isNaN(d.getTime()) && d > new Date()
  }, { message: 'Fecha inválida o en el pasado' }),
  // Notas opcionales: si no se envía, no falla.
  // Si se envía, debe ser string (puede ser vacío "").
  notes: z.string().optional(),
})
/**
 * Schema para PATCH /api/appointments/:id/status (body).
 *
 * .enum(): solo acepta exactamente esos dos valores.
 * Si el cliente envía { status: 'PROGRAMADA' } → falla (no está en el enum).
 * Si envía { status: 'completada' } (minúscula) → falla (case-sensitive).
 */
export const updateStatusSchema = z.object({
  status: z.enum(['COMPLETADA', 'CANCELADA']),
})
/**
 * Schema para GET /api/appointments/doctor/:doctorId/schedule (query params).
 *
 * Valida que `from` y `to` existan y sean strings.
 * No valida que sean fechas válidas ni que from < to.
 * (Mejora opcional: agregar .refine() con el mismo patrón que en `date`.)
 */
export const doctorScheduleQuery = z.object({
  from: z.string(),
  to: z.string(),
})
/**
 * z.infer<>: extrae el tipo TypeScript del schema automáticamente.
 * Equivalente a escribir a mano:
 *   { patientId: number; doctorId: number; date: string; notes?: string }
 *
 * Se usa para tipar parámetros de funciones sin duplicar la definición:
 *   function create(data: CreateAppointmentInput) { ... }
 *
 * Si cambias el schema (agregas un campo, lo haces requerido),
 * el tipo se actualiza solo. No hay que mantener dos cosas sincronizadas.
 */
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>   