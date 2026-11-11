import type { Request, Response } from 'express';
import { patientsService } from './patients.service';
import { createPatientSchema } from './patients.validation';

export const patientsController = {
  async create(req: Request, res: Response) {
    const parsed = createPatientSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }
    const patient = await patientsService.create(parsed.data);
    res.status(201).json(patient);
  },

  async findAll(_req: Request, res: Response) {
    const patients = await patientsService.findAll();
    res.json(patients);
  },

  async findById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const patient = await patientsService.findById(id);
    if (!patient) return res.status(404).json({ message: 'Paciente no encontrado' });
    res.json(patient);
  },

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const patient = await patientsService.update(id, req.body);
    res.json(patient);
  },

  async remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    await patientsService.remove(id);
    res.status(204).send();
  },
};   