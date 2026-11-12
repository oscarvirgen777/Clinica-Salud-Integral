import { prisma } from '../../config/prisma'
import type { CreatePatientInput } from './patients.validation'
import { AppError } from '../../errors/AppError'

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
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      appointments: {
        include: { doctor: true },
        orderBy: { date: 'desc' },
      },
    },
  })

  if (!patient) return null

  return {
    ...patient,
    dateOfBirth: patient.dateOfBirth.toISOString().split('T')[0],
  }
},


 async update(id: number, data: Partial<CreatePatientInput>) {
  return prisma.patient.update({
    where: { id },
    data: {
      ...data,
      ...(data.dateOfBirth && { dateOfBirth: new Date(data.dateOfBirth) }),
    },
  })
},

  async remove(id: number) {
    const appointments = await prisma.appointment.count({ where: { patientId: id } })
    if (appointments > 0) {
      throw new AppError('No se puede eliminar un paciente con citas registradas', 409)
    }
    return prisma.patient.delete({ where: { id } })
  },
}   