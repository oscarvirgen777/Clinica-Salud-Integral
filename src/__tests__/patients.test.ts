import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../app'
import { prisma } from '../config/prisma'
import jwt from 'jsonwebtoken'


// Helper: genera un token para el usuario seed
async function getToken(role: 'RECEPCIONISTA' | 'MEDICO' | 'GERENCIA') {
  const user = await prisma.user.findFirst({ where: { role } })
  if (!user) throw new Error('User seed no encontrado')

  const jwt = await import('jsonwebtoken')
  return jwt.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '1h' })
}

describe('GET /api/patients/:id (Expediente)', () => {
  it('debe devolver paciente con sus citas', async () => {
    const token = await getToken('RECEPCIONISTA')
    const res = await request(app).get('/api/patients/1').set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('name')
    expect(res.body).toHaveProperty('email')
    expect(res.body).toHaveProperty('appointments')
    expect(Array.isArray(res.body.appointments)).toBe(true)
  })

  it('debe devolver 404 si no existe', async () => {
    const token = await getToken('RECEPCIONISTA')
    const res = await request(app).get('/api/patients/99999').set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })
})

describe('POST /api/patients (Alta)', () => {
it('debe crear un paciente válido', async () => {
  const token = await getToken('RECEPCIONISTA')
  const uniqueEmail = `test-${Date.now()}@example.com`

  const res = await request(app)
    .post('/api/patients')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Paciente Test',
      email: uniqueEmail,
      phone: '555-9999',
      dateOfBirth: '1990-01-15',
    })

  expect(res.status).toBe(201)
  expect(res.body).toHaveProperty('id')
  expect(res.body.name).toBe('Paciente Test')
})

  it('debe rechazar fecha de nacimiento futura', async () => {
    const token = await getToken('RECEPCIONISTA')
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Paciente Futuro',
        email: 'futuro@example.com',
        phone: '555-8888',
        dateOfBirth: '2099-01-01',
      })

    expect(res.status).toBe(400)
  })

  it('debe rechazar email mal formateado', async () => {
    const token = await getToken('RECEPCIONISTA')
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Paciente Mal',
        email: 'no-es-email',
        phone: '555-7777',
        dateOfBirth: '1990-01-15',
      })

    expect(res.status).toBe(400)
  })
})   