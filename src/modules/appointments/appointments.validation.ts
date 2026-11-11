import { z } from 'zod'

export const createAppointmentSchema = z.object({
  patientId: z.number().int().positive(),
  doctorId: z.number().int().positive(),
  date: z.string().refine((val) => {
    const d = new Date(val)
    return !isNaN(d.getTime()) && d > new Date()
  }, { message: 'Fecha inválida o en el pasado' }),
  notes: z.string().optional(),
})

export const updateStatusSchema = z.object({
  status: z.enum(['COMPLETADA', 'CANCELADA']),
})

export const doctorScheduleQuery = z.object({
  from: z.string(),
  to: z.string(),
})

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>   