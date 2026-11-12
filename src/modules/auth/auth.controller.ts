import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../config/prisma'



export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role, doctorId: user.doctorId },
  process.env.JWT_SECRET as string,
  { expiresIn: '8h' }
)

    res.json({ token })
  } catch {
    res.status(500).json({ message: 'Error al iniciar sesión' })
  }
}