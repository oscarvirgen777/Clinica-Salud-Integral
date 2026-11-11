import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../app'
import { prisma } from '../config/prisma'
import jwt from 'jsonwebtoken'

async function getToken(role: 'GERENCIA') {
  const user = await prisma.user.findFirst({ where: { role } })
  return jwt.sign({ id: user!.id, email: user!.email, role: user!.role }, process.env.JWT_SECRET!, { expiresIn: '1h' })
}

describe('GET /api/reports/volume-by-specialty', () => {
  it('debe devolver citas agrupadas por especialidad', async () => {
    const token = await getToken('GERENCIA')
    const res = await request(app).get('/api/reports/volume-by-specialty').set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body[0]).toHaveProperty('specialty')
    expect(res.body[0]).toHaveProperty('total')
  })

  it('debe rechazar si no es GERENCIA', async () => {
    const user = await prisma.user.findFirst({ where: { role: 'RECEPCIONISTA' } })
    const token = jwt.sign({ id: user!.id, email: user!.email, role: user!.role }, process.env.JWT_SECRET!, { expiresIn: '1h' })

    const res = await request(app).get('/api/reports/volume-by-specialty').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(403)
  })
})

describe('GET /api/reports/daily', () => {
  it('debe devolver corte del día', async () => {
    const token = await getToken('GERENCIA')
    const res = await request(app).get('/api/reports/daily?date=2026-11-10').set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('completed')
    expect(res.body).toHaveProperty('cancelled')
  })
})   