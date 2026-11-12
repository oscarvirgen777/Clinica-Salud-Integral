import type { Request, Response, NextFunction } from 'express'

type Role = 'RECEPCIONISTA' | 'MEDICO' | 'GERENCIA'

export function authorize(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' })
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'No tienes permisos suficientes' })
    }
    next()
  }
}   

// Autorización por pertenencia
export function ownDoctorResource() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'MEDICO') {
      return res.status(403).json({ message: 'Solo médicos pueden acceder a esta recurso' })
    }

    const urlDoctorId = Number(req.params.doctorId)
    if (!req.user.doctorId || req.user.doctorId !== urlDoctorId) {
      return res.status(403).json({
        message: 'No puedes acceder a la agenda de otro médico',
      })
    }

    next()
  }
}

// Verificar que la cita sea del médico logueado
export function ownAppointment() {
  return async (req: Request, res: Response, next: NextFunction) => {

    if (!req.user || req.user.role !== 'MEDICO') {
      return res.status(403).json({ message: 'Solo médicos pueden actualizar citas' })
    }

    const { prisma } = await import('../config/prisma')
    const appointmentId = Number(req.params.id)

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { doctorId: true },
    })

    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' })
    }

    if (appointment.doctorId !== req.user.doctorId) {
      return res.status(403).json({
        message: 'No puedes actualizar una cita que no es tuya',
      })
    }

    next()
  }
}   