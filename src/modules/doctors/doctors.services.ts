import { prisma } from '../../config/prisma';
import type { CreateDoctorInput } from './doctors.validation';

export const doctorsService = {
  async create(data: CreateDoctorInput) {
    return prisma.doctor.create({ data });
  },

async findAll(specialty?: string) {
  return prisma.doctor.findMany({
    where: specialty ? { specialty: { name: specialty } } : undefined,
    include: { specialty: true },
  });
},

async findById(id: number) {
  return prisma.doctor.findUnique({
    where: { id },
    include: { specialty: true },
  });
},
  async remove(id: number) {
    return prisma.doctor.delete({ where: { id } });
  },
};  