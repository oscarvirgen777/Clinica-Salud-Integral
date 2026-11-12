import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../app'
import { prisma } from '../config/prisma'
import jwt from 'jsonwebtoken'

async function getToken(role: 'RECEPCIONISTA' | 'MEDICO' | 'GERENCIA') {
  const user = await prisma.user.findFirst({ where: { role } })
  return jwt.sign(
    { id: user!.id, email: user!.email, role: user!.role, doctorId: user!.doctorId },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  )
}

async function getTokenById(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  return jwt.sign(
    { id: user!.id, email: user!.email, role: user!.role, doctorId: user!.doctorId },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  )
}

describe('POST /api/appointments (Agendar)', () => {
  it('debe crear una cita válida', async () => {
    const token = await getToken('RECEPCIONISTA')
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        patientId: 1,
        doctorId: 1,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })

    expect(res.status).toBe(201)
    expect(res.body.status).toBe('PROGRAMADA')
  })

  it('debe rechazar cita en fecha pasada', async () => {
    const token = await getToken('RECEPCIONISTA')
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        patientId: 1,
        doctorId: 1,
        date: '2020-01-01T10:00:00.000Z',
      })

    expect(res.status).toBe(400)
  })

  it('debe rechazar si el paciente no existe', async () => {
    const token = await getToken('RECEPCIONISTA')
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        patientId: 99999,
        doctorId: 1,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })

    expect(res.status).toBe(404)
  })
})

describe('PATCH /api/appointments/:id/status', () => {
  it('debe cambiar estado a COMPLETADA', async () => {
    await prisma.appointment.update({
      where: { id: 1 },
      data: { status: 'PROGRAMADA' },
    })

    const token = await getTokenById(2)

    const res = await request(app)
      .patch('/api/appointments/1/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'COMPLETADA' })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('COMPLETADA')
  })
})   