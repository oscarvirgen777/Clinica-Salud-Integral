import type { Request, Response } from 'express';
import { doctorsService } from './doctors.services';
import { createDoctorSchema, listDoctorsQuery } from './doctors.validation';
import { NotFoundError } from '../../errors/NotFoundError'
import { AppError } from '../../errors/AppError'   

export const doctorsController = {
async create(req: Request, res: Response) {
  const parsed = createDoctorSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() })
  }

  try {
    const doctor = await doctorsService.create(parsed.data)
    res.status(201).json(doctor)
  } catch (e: any) {
    if (e.code === 'P2002') {
      throw new AppError('Ya existe un médico con ese email', 409)
    }
    throw e
  }
},

  async findAll(req: Request, res: Response) {
    const query = listDoctorsQuery.parse(req.query);
    const doctors = await doctorsService.findAll(query.specialty);
    res.json(doctors);
  },

  async findById(req: Request, res: Response) {
    const doctor = await doctorsService.findById(Number(req.params.id));
    if (!doctor) return res.status(404).json({ message: 'Médico no encontrado' });
    res.json(doctor);
  },

  async remove(req: Request, res: Response) {
  const id = Number(req.params.id)
  try {
    await doctorsService.remove(id)
    res.json({ message: `Médico ${id} eliminado correctamente` })
  } catch (e: any) {
    if (e.code === 'P2025') throw new NotFoundError('Médico', id)
    if (e.code === 'P2003') throw new AppError('No se puede eliminar un médico con citas registradas', 409)
    throw e
  }
}
}