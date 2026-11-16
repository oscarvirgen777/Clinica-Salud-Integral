import type { Request, Response } from 'express'
import { patientsService } from './patients.service'
import { createPatientSchema } from './patients.validation'
import { NotFoundError } from '../../errors/NotFoundError'
import { AppError } from '../../errors/AppError'

/**
 * CONTROLADOR de pacientes.
 *
 * Mismo patrón que doctors.controller:
 *   - safeParse en el controller (no middleware validate)
 *   - try/catch para mapear errores Prisma (P2002, P2025)
 *   - throw → error middleware global responde
 */
export const patientsController = {
    /**
   * POST /api/patients
   * Rol: RECEPCIONISTA
   * Registrar un nuevo paciente.
   */
  async create(req: Request, res: Response) {
      // Valida el body con Zod.
    // Si falta algún campo requerido o el formato es inválido → 400.
    const parsed = createPatientSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() })
    }

    try {
      const patient = await patientsService.create(parsed.data)
      res.status(201).json(patient)
    } catch (e: any) {
       // P2002 = Unique constraint violation (email duplicado).
      // El email es @unique en el schema Prisma.
      if (e.code === 'P2002') {
        throw new AppError('Ya existe un paciente con ese email', 409)
      }
            // Otros errores → error middleware global (500).
      throw e
    }
  },

  /**
   * GET /api/patients
   * Rol: Autenticado (cualquier rol)
   * Listar todos los pacientes.
   *
   * _req con underscore: el parámetro es requerido por la firma
   * de Express pero no se usa (no hay query params ni filtros).
   */
  async findAll(_req: Request, res: Response) {
    const patients = await patientsService.findAll()
    res.json(patients)
  },

  /**
   * GET /api/patients/:id
   * Rol: Autenticado
   * Expediente completo del paciente (con sus citas).
   */
  async findById(req: Request, res: Response) {
    const id = Number(req.params.id)
    
    // El service devuelve null si no existe.
    // Aquí se lanza NotFoundError (en vez de responder 404 directamente
    // como en doctors.findById). Ambos estilos son válidos.
    const patient = await patientsService.findById(id)
    if (!patient) throw new NotFoundError('Paciente', id)
    res.json(patient)
  },

  
  /**
   * PUT /api/patients/:id
   * Rol: RECEPCIONISTA
   * Actualizar paciente (parcial o completo).
   */
  async update(req: Request, res: Response) {
    const id = Number(req.params.id)
      // .partial(): hace TODOS los campos opcionales.
    // Equivalente a:
    //   z.object({
    //     name: z.string().optional(),
    //     email: z.string().email().optional(),
    //     phone: z.string().optional(),
    //     dateOfBirth: z.string().optional(),
    //     address: z.string().optional(),
    //   })
    //
    // Esto permite actualizar SOLO los campos que el cliente envíe:
    //   PUT /api/patients/1  { "phone": "555-9999" }  → solo cambia phone
    //   PUT /api/patients/1  { "name": "X", "email": "y@z.com" }  → cambia ambos
    //
    // ⚠️ Si el body está vacío {} → parsed.data = {} → Prisma update
    // con data: {} → no cambia nada (no es error, pero tampoco es útil).
    // Mejora opcional: .refine(data => Object.keys(data).length > 0)
    const parsed = createPatientSchema.partial().safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() })
    }

    try {
      const patient = await patientsService.update(id, parsed.data)
      res.json(patient)
    } catch (e: any) {
            // P2025 = el paciente no existe.
      if (e.code === 'P2025') throw new NotFoundError('Paciente', id)
             // P2002 = email duplicado (al actualizar el email a uno ya usado).
      if (e.code === 'P2002') throw new AppError('Ya existe un paciente con ese email', 409)
      throw e
    }
  },
/**
 * DELETE /api/patients/:id
 * Rol: RECEPCIONISTA
 * Eliminar un paciente.
 */
async remove(req: Request, res: Response) {
  // Extrae el id de la URL. req.params siempre son string → Number().
  const id = Number(req.params.id);

  try {
    // Delega al service: prisma.patient.delete({ where: { id } })
    await patientsService.remove(id);

    // 200 OK con mensaje de confirmación.
    res.json({ message: `Paciente ${id} eliminado correctamente` });

  } catch (e: any) {
    // P2025 = el registro no existe en la BD.
    // Prisma lo lanza cuando se intenta eliminar un id que no está.
    if (e.code === 'P2025') throw new NotFoundError('Paciente', id);

    // P2003 = Foreign key constraint violation.
    // Ocurre porque en el schema Prisma la relación
    // Patient → Appointment no especifica onDelete (default: Restrict).
    // PostgreSQL impide eliminar el paciente si tiene citas asociadas.
    if (e.code === 'P2003') {
      throw new AppError('No se puede eliminar un paciente con citas registradas', 409);
    }

    // Cualquier otro error (BD caída, timeout, etc.)
    // → se re-lanza al error middleware global → 500.
    throw e;
    }
  },
}