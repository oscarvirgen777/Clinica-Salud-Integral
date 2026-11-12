import type { Request, Response } from 'express'
import { patientsService } from './patients.service'
import { createPatientSchema } from './patients.validation'
import { NotFoundError } from '../../errors/NotFoundError'
import { AppError } from '../../errors/AppError'

export const patientsController = {
  async create(req: Request, res: Response) {
    const parsed = createPatientSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() })
    }

    try {
      const patient = await patientsService.create(parsed.data)
      res.status(201).json(patient)
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new AppError('Ya existe un paciente con ese email', 409)
      }
      throw e
    }
  },

  async findAll(_req: Request, res: Response) {
    const patients = await patientsService.findAll()
    res.json(patients)
  },

  async findById(req: Request, res: Response) {
    const id = Number(req.params.id)
    const patient = await patientsService.findById(id)
    if (!patient) throw new NotFoundError('Paciente', id)
    res.json(patient)
  },

  async update(req: Request, res: Response) {
    const id = Number(req.params.id)
    const parsed = createPatientSchema.partial().safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() })
    }

    try {
      const patient = await patientsService.update(id, parsed.data)
      res.json(patient)
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundError('Paciente', id)
      if (e.code === 'P2002') throw new AppError('Ya existe un paciente con ese email', 409)
      throw e
    }
  },

async remove(req: Request, res: Response) {
  const id = Number(req.params.id)
  try {
    await patientsService.remove(id)
    res.json({ message: `Paciente ${id} eliminado correctamente` })
  } catch (e: any) {
    if (e.code === 'P2025') throw new NotFoundError('Paciente', id)
    throw e
  }
}   
}   