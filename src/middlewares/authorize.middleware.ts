import type { Request, Response, NextFunction } from 'express'

// Unión de literales: los tres roles que existen en el sistema.
// Se usa para tipar los parámetros de la factory `authorize`.
type Role = 'RECEPCIONISTA' | 'MEDICO' | 'GERENCIA'

/**
 * FACTORY de middleware de AUTORIZACIÓN POR ROL.
 *
 * Patrón: una función que recibe argumentos y DEVUELVE un middleware.
 * Esto permite reutilizar el mismo middleware con distintos roles:
 *
 *   router.post('/', authorize('RECEPCIONISTA'), handler)
 *   router.get('/',  authorize('RECEPCIONISTA', 'MEDICO', 'GERENCIA'), handler)
 *
 * Diferencia con auth.middleware.ts:
 *   - auth  → ¿quién eres? (401 si no hay token válido)
 *   - authorize → ¿qué puedes hacer? (403 si tu rol no está permitido)
 *
 * DEBE montarse SIEMPRE después de verifyToken:
 *   router.use(verifyToken, authorize('MEDICO'), handler)
 */
export function authorize(...roles: Role[]) {
    // Devuelve el middleware real (closure sobre `roles`):
  return (req: Request, res: Response, next: NextFunction) => {
    // Guard: si req.user no existe, es que el middleware de auth no corrió.
    // No debería pasar (authorize siempre va después de verifyToken),
    // pero es un defensive check. → 401 (no autenticado, no 403).
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' })
    }
    
    // Compara el rol del usuario (del JWT) contra la lista permitida.
    // roles.includes → true si el rol del usuario está en la lista.
    // Si NO está → 403 Forbidden (autenticado pero sin permiso).
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'No tienes permisos suficientes' })
    }
        // Rol permitido → pasar al siguiente middleware / handler.
    next()
  }
}   

/**
 * AUTORIZACIÓN POR PERTENENCIA (ownership).
 *
 * No basta con ser MEDICO: además, el recurso debe ser DEL médico logueado.
 * Caso de uso: GET /api/appointments/doctor/:doctorId/schedule
 *   - Un médico NO puede ver la agenda de OTRO médico.
 *   - Solo puede ver la Suya (req.user.doctorId === params.doctorId).
 *
 * Montaje:
 *   router.get('/doctor/:doctorId/schedule',
 *     verifyToken,
 *     authorize('MEDICO'),          // ← primero: ¿eres médico?
 *     ownDoctorResource(),           // ← después: ¿es TU agenda?
 *     handler
 *   )
 */
export function ownDoctorResource() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Debe ser MEDICO (redundante si ya pasó authorize('MEDICO'),
    // pero hace el middleware auto-suficiente si se usa solo).
    if (!req.user || req.user.role !== 'MEDICO') {
      return res.status(403).json({ message: 'Solo médicos pueden acceder a esta recurso' })
    }
    // Extrae el doctorId de la URL (ej: /doctor/5/schedule → 5).
    // Number() lo convierte de string (params siempre son string) a number.
    const urlDoctorId = Number(req.params.doctorId)
    
    // Compara: el doctorId del token (JWT) vs. el de la URL.
    // Si no coinciden → el médico está intentando ver la agenda de otro.
    if (!req.user.doctorId || req.user.doctorId !== urlDoctorId) {
      return res.status(403).json({
        message: 'No puedes acceder a la agenda de otro médico',
      })
    }

    next()
  }
}
/**
 * AUTORIZACIÓN POR PERTENENCIA (ownership) — versión ASYNC con query a BD.
 *
 * Caso de uso: PATCH /api/appointments/:id/status
 *   - Un médico solo puede cambiar el estado de SUS citas.
 *   - No basta con el rol: hay que verificar que la cita
 *     pertenezca al doctorId del token.
 *
 * Diferencia con ownDoctorResource():
 *   - ownDoctorResource compara un param de URL contra el token (sin BD).
 *   - ownAppointment hace una QUERY a la BD para obtener el doctorId
 *     de la cita y compararlo con el del token.
 *
 * Montaje:
 *   router.patch('/:id/status',
 *     verifyToken,
 *     authorize('MEDICO'),
 *     ownAppointment(),              // ← verifica ownership en BD
 *     handler
 *   )
 */
export function ownAppointment() {
   // ASYNC: porque hace una query a la BD (await prisma...).
  // Express 4 no maneja async throws nativamente,
  // pero aquí no se lanza error: se responde directamente con res.status().
  return async (req: Request, res: Response, next: NextFunction) => {
    // Debe ser MEDICO.
    if (!req.user || req.user.role !== 'MEDICO') {
      return res.status(403).json({ message: 'Solo médicos pueden actualizar citas' })
    }
   // Import dinámico de prisma:
    // - Evita un ciclo de importación si prisma.ts importara algo de middlewares.
    // - Alternativa: import estático en la parte superior (más común).
    // - El `await import()` devuelve el módulo, de donde se desestructura `prisma`.
    const { prisma } = await import('../config/prisma')
        // Extrae el id de la cita de la URL (ej: /appointments/42/status → 42).
    const appointmentId = Number(req.params.id)
 // Query a BD: busca la cita y selecciona SOLO el doctorId.
    // select: { doctorId: true } → minimiza datos transferidos.
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { doctorId: true },
    })
    // Si la cita no existe → 404 (no es 403: el recurso simplemente no está).
    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' })
    }
    // Comparación de ownership:
    // El doctorId de la cita (de la BD) debe ser === al del token (JWT).
    // Si no → el médico está intentando modificar una cita de otro.
    if (appointment.doctorId !== req.user.doctorId) {
      return res.status(403).json({
        message: 'No puedes actualizar una cita que no es tuya',
      })
    }
    // Todo OK → la cita es del médico logueado, pasar al handler.
    next()
  }
}   