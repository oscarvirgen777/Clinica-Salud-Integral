import { prisma } from '../../config/prisma'
import { AppError } from '../../errors/AppError'
import { NotFoundError } from '../../errors/NotFoundError'

type AppointmentStatus = 'PROGRAMADA' | 'COMPLETADA' | 'CANCELADA'

export const appointmentsService = {
  async create(data: { patientId: number; doctorId: number; date: string; notes?: string }) {
    const [patient, doctor] = await Promise.all([
      prisma.patient.findUnique({ where: { id: data.patientId } }),
      prisma.doctor.findUnique({ where: { id: data.doctorId } }),
    ])
    if (!patient) throw new NotFoundError('Paciente', data.patientId)
    if (!doctor) throw new NotFoundError('Médico', data.doctorId)

    return prisma.appointment.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        date: new Date(data.date),
        notes: data.notes,
      },
      include: { patient: true, doctor: true },
    })
  },

  async doctorSchedule(doctorId: number, from: string, to: string) {
    return prisma.appointment.findMany({
      where: {
        doctorId,
        date: { gte: new Date(from), lte: new Date(to) },
      },
      include: { patient: true },
      orderBy: { date: 'asc' },
    })
  },

  async updateStatus(id: number, status: AppointmentStatus) {
    const appointment = await prisma.appointment.findUnique({ where: { id } })
    if (!appointment) throw new NotFoundError('Cita', id)

    return prisma.appointment.update({
      where: { id },
      data: { status },
      include: { patient: true, doctor: true },
    })
  },

  async findById(id: number) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { patient: true, doctor: true },
    })
    if (!appointment) throw new NotFoundError('Cita', id)
    return appointment
  },
}   