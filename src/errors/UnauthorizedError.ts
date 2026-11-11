import { AppError } from './AppError'

export class UnauthorizedError extends AppError {
  constructor(message: string = 'No autenticado') {
    super(message, 401)
  }
}   