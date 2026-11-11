import type { Request, Response } from 'express';
import { doctorsService } from './doctors.services';
import { createDoctorSchema, listDoctorsQuery } from './doctors.validation';

export const doctorsController = {
  async create(req: Request, res: Response) {
    const parsed = createDoctorSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
    const doctor = await doctorsService.create(parsed.data);
    res.status(201).json(doctor);
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
    await doctorsService.remove(Number(req.params.id));
    res.status(204).send();
  },
};   