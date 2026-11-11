import { prisma } from '../../config/prisma';
import type { CreateDoctorInput } from './doctors.validation';

export const doctorsService = {
  async create(data: CreateDoctorInput) {
    return prisma.doctor.create({ data });
  },

  async findAll(specialty?: string) {
    return prisma.doctor.findMany({
      where: specialty ? { specialty } : undefined,
    });
  },

  async findById(id: number) {
    return prisma.doctor.findUnique({ where: { id } });
  },

  async remove(id: number) {
    return prisma.doctor.delete({ where: { id } });
  },
};   