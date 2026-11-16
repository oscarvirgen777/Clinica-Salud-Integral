// Tipos de Express para tipar los parámetros de cada handler.
// Se omite NextFunction porque estos handlers NO llaman a next():
// siempre terminan con res.json() o res.status().json().
import type { Request, Response } from 'express';

// El SERVICE contiene toda la lógica de negocio (queries a BD, reglas).
// El controller solo: extrae datos ya validados → delega al service → responde.
// La validación de entrada la hace el middleware `validate` (en routes.ts),
// así que aquí req.body y req.query YA están parseados por Zod.
import { appointmentsService } from './appointments.service';

/**
 * CONTROLADOR de citas.
 *
 * Patrón: objeto con métodos (no clase) porque no hay estado.
 * Cada método es un handler de Express que:
 *   1. Extrae datos ya validados del request
 *   2. Delega la lógica al service
 *   3. Responde con el resultado
 *
 * NO hay try/catch en ningún handler:
 * Los errores del service (NotFoundError, AppError, errores de Prisma)
 * se propagan como rejects de la Promise y son capturados
 * por el error middleware global (errorHandler en app.ts).
 */
export const appointmentsController = {

  /**
   * POST /api/appointments
   * Rol: RECEPCIONISTA (verificado por authorize en routes)
   * req.body YA fue validado por validate(createAppointmentSchema).
   *
   * El service:
   *   - Verifica que la fecha no sea pasada (regla de negocio)
   *   - Crea la cita con status 'PROGRAMADA'
   *   - Si paciente o médico no existen → NotFoundError (404)
   */
  async create(req: Request, res: Response) {
    // req.body ya tiene los datos parseados (con transforms/defaults de Zod).
    const appointment = await appointmentsService.create(req.body);

    // 201 Created: se creó un recurso nuevo.
    res.status(201).json(appointment);
  },

  /**
   * GET /api/appointments/doctor/:doctorId/schedule?from=&to=
   * Rol: MEDICO (verificado por authorize + ownDoctorResource en routes)
   * req.query YA fue validado por validate(doctorScheduleQuery, 'query').
   *
   * El middleware ownDoctorResource ya verificó que el doctorId
   * de la URL coincida con el del token (no puede ver agenda ajena).
   */
  async doctorSchedule(req: Request, res: Response) {
    // req.params siempre son string → Number() lo convierte a number.
    const doctorId = Number(req.params.doctorId);

    // req.query.from y req.query.to ya son los valores parseados por Zod.
    // El `as string` es necesario porque req.query tiene tipo
    // ParsedQs (string | string[] | ParsedQs | ...), pero Zod
    // ya garantizó que son string.
    const schedule = await appointmentsService.doctorSchedule(
      doctorId,
      req.query.from as string,
      req.query.to as string
    );

    // 200 OK: se recuperó información existente.
    res.json(schedule);
  },

  /**
   * PATCH /api/appointments/:id/status
   * Rol: MEDICO (verificado por authorize + ownAppointment en routes)
   * req.body YA fue validado por validate(updateStatusSchema).
   *
   * El middleware ownAppointment ya verificó (con query a BD)
   * que la cita pertenezca al médico logueado.
   *
   * El service:
   *   - Busca la cita (si no existe → NotFoundError → 404)
   *   - Actualiza el status en la BD
   *   - Devuelve la cita actualizada
   */
  async updateStatus(req: Request, res: Response) {
    const id = Number(req.params.id);

    // req.body.status ya es 'COMPLETADA' | 'CANCELADA' (validado por Zod).
    const appointment = await appointmentsService.updateStatus(id, req.body.status);

    // 200 OK: se actualizó un recurso existente.
    res.json(appointment);
  },

  /**
   * GET /api/appointments/:id
   * Rol: Autenticado (cualquier rol con token válido)
   * Sin validación Zod (solo un id numérico en params).
   *
   * El service:
   *   - Busca la cita por id con include de patient y doctor
   *   - Si no existe → NotFoundError → 404
   */
  async findById(req: Request, res: Response) {
    const appointment = await appointmentsService.findById(Number(req.params.id));

    res.json(appointment);
  },
};   