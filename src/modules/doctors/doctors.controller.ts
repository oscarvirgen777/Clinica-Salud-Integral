import type { Request, Response } from 'express';
import { doctorsService } from './doctors.services';
import { createDoctorSchema, listDoctorsQuery } from './doctors.validation';
import { NotFoundError } from '../../errors/NotFoundError'
import { AppError } from '../../errors/AppError'   



/**
 * CONTROLADOR de médicos.
 *
 * Patrón: objeto con métodos (no clase, no hay estado).
 *
 * Diferencia con appointments.controller:
 *   - Aquí SÍ hay try/catch en `create` y `remove` para mapear
 *     errores específicos de Prisma (códigos P2002, P2025, P2003)
 *     a errores de aplicación con statusCode claro.
 *   - En appointments se delegaba todo al error middleware global.
 *
 * Ambos enfoques son válidos; este es más explícito.
 */
export const doctorsController = {
   /**
   * POST /api/doctors
   * Rol: RECEPCIONISTA
   * Registrar un nuevo médico.
   */
async create(req: Request, res: Response) {
      // Validación del body con Zod (safeParse → no lanza, devuelve resultado).
  const parsed = createDoctorSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() })
  }

  try {
    const doctor = await doctorsService.create(parsed.data)
    res.status(201).json(doctor)
  } catch (e: any) {
      // P2002 = PrismaClientKnownRequestError: Unique constraint violation.
      // Ocurre cuando se intenta insertar un email que ya existe (@unique).
      // Se mapea a 409 Conflict con mensaje claro.
    if (e.code === 'P2002') {
      throw new AppError('Ya existe un médico con ese email', 409)
    }
          // Cualquier otro error se re-lanza → error middleware global (500).
    throw e
  }
},
 /**
   * GET /api/doctors?specialty=
   * Rol: Autenticado (cualquier rol)
   * Listar médicos, opcionalmente filtrados por especialidad.
   */
  async findAll(req: Request, res: Response) {
    // Valida los query params con Zod.
    // ⚠️ Usa .parse() (no safeParse): si falla, lanza ZodError
    // → error middleware → 500 genérico.
    // (Inconsistencia menor, como en appointments. Mejora: usar el
    //  middleware validate(listDoctorsQuery, 'query') en routes.)
    const query = listDoctorsQuery.parse(req.query);
    const doctors = await doctorsService.findAll(query.specialty);
    res.json(doctors);
  },
   /**
   * GET /api/doctors/:id
   * Rol: Autenticado
   * Detalle de un médico.
   */

  async findById(req: Request, res: Response) {
      // El service devuelve null si no existe (no lanza).
    // El controller responde 404 directamente.
    // (Alternativa: que el service lance NotFoundError y no haya
    //  este if. Ambos son válidos.)
    const doctor = await doctorsService.findById(Number(req.params.id));
    if (!doctor) return res.status(404).json({ message: 'Médico no encontrado' });
    res.json(doctor);
  },
 /**
   * DELETE /api/doctors/:id
   * Rol: RECEPCIONISTA
   * Eliminar un médico.
   */
  async remove(req: Request, res: Response) {
  const id = Number(req.params.id)
  try {
    await doctorsService.remove(id)
    res.json({ message: `Médico ${id} eliminado correctamente` })
  } catch (e: any) {
    // P2025 = PrismaClientKnownRequestError: Record to update not found.
      // Ocurre si el id no existe en la BD.
    if (e.code === 'P2025') throw new NotFoundError('Médico', id)
      
      // P2003 = PrismaClientKnownRequestError: Foreign key constraint violation.
      // Ocurre si el médico tiene citas asociadas y la relación
      // es onDelete: Restrict (no se puede eliminar).
    if (e.code === 'P2003') throw new AppError('No se puede eliminar un médico con citas registradas', 409)
            // Cualquier otro error → error middleware global (500).
    throw e
  }
}
}