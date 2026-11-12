import * as bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../config/prisma'
import { AppError } from '../../errors/AppError'

type Role = 'RECEPCIONISTA' | 'MEDICO' | 'GERENCIA'

export const authService = {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } })


    if (!user) throw new AppError('Credenciales inválidas', 401)

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) throw new AppError('Credenciales inválidas', 401)

    const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role, doctorId: user.doctorId },
      process.env.JWT_SECRET!,
      { expiresIn: '8h' }
    )

    return { token, user: { id: user.id, name: user.name, role: user.role } }
  },
}   