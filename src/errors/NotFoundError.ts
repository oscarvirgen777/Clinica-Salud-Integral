import { AppError } from './AppError'

export class NotFoundError extends AppError {
  constructor(resource: string, id: number | string) {
    super(`${resource} con id ${id} no encontrado`, 404)
  }
}   