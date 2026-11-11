import type { Request, Response } from 'express'
import { appointmentsService } from './appointments.service'
import { createAppointmentSchema, updateStatusSchema, doctorScheduleQuery } from './appointments.validation'

export const appointmentsController = {
  async create(req: Request, res: Response) {
    const parsed = createAppointmentSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() })
    }
    // NO hay try/catch → el NotFoundError sube al errorHandler global (404)
    const appointment = await appointmentsService.create(parsed.data)
    res.status(201).json(appointment)
  },

  async doctorSchedule(req: Request, res: Response) {
    const doctorId = Number(req.params.doctorId)
    const query = doctorScheduleQuery.parse(req.query)
    const schedule = await appointmentsService.doctorSchedule(doctorId, query.from, query.to)
    res.json(schedule)
  },

  async updateStatus(req: Request, res: Response) {
    const id = Number(req.params.id)
    const parsed = updateStatusSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() })
    }
    // NO hay try/catch → el NotFoundError sube al errorHandler global (404)
    const appointment = await appointmentsService.updateStatus(id, parsed.data.status)
    res.json(appointment)
  },

  async findById(req: Request, res: Response) {
    const appointment = await appointmentsService.findById(Number(req.params.id))
    res.json(appointment)
  },
}   