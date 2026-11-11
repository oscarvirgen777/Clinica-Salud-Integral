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