import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import type { RequestHandler } from 'express'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Clínica Salud Integral',
      version: '1.0.0',
      description: 'API RESTful para gestión de pacientes, médicos, citas y reportes',
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    tags: [
      { name: 'Auth', description: 'Autenticación' },
      { name: 'Pacientes', description: 'Módulo de Recepción' },
      { name: 'Médicos', description: 'Directorio de especialistas' },
      { name: 'Citas', description: 'Agendamiento y atención' },
      { name: 'Reportes', description: 'Análisis de datos para gerencia' },
    ],
  },
  apis: ['./src/modules/**/*.routes.ts'],
}

const swaggerSpec = swaggerJsdoc(options)

export const swaggerDocs: RequestHandler[] = swaggerUi.serve
export const swaggerSetup: RequestHandler = swaggerUi.setup(swaggerSpec)