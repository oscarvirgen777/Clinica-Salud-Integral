import { prisma } from '../../config/prisma'
import type { CreatePatientInput } from './patients.validation'

export const patientsService = {
  async create(data: CreatePatientInput) {
    return prisma.patient.create({
      data: {
        ...data,
        dateOfBirth: new Date(data.dateOfBirth),
      },
    })
  },

  async findAll() {
    return prisma.patient.findMany()
  },

  async findById(id: number) {
    return prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: {
          include: { doctor: true },
          orderBy: { date: 'desc' },
        },
      },
    })
  },

  async update(id: number, data: Partial<CreatePatientInput>) {
    return prisma.patient.update({ where: { id }, data })
  },

  async remove(id: number) {
    return prisma.patient.delete({ where: { id } })
  },
}   