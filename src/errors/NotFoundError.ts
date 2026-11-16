import { AppError } from './AppError'
/**
 * Error para cuando un recurso no existe en la BD.
 * Se lanza desde controladores/servicios tras una query
 * que devuelve null (ej: prisma.patient.findUnique → null).
 *
 * El error middleware lo captura, lee statusCode (404)
 * y responde: { "message": "Paciente con id 5 no encontrado" }
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id: number | string) {
        // Nombre del recurso en texto (ej: "Paciente", "Médico", "Cita")
    // El id buscado (numérico o string según la tabla)


    // Delega a AppError con:
    // - mensaje descriptivo generado con template literal
    // - statusCode 404 (Not Found)
    // - isOperational → true (por default, es un error esperado)
    super(`${resource} con id ${id} no encontrado`, 404)
  }
}   