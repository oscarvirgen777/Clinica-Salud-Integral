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

    // Bases URL desde donde el usuario puede invocar los endpoints
    // (Swagger UI usa esto para el botón "Try it out").
    servers: [{ url: 'http://localhost:3000' }],
    components: {
         // Declara el esquema de autenticación JWT (Bearer Token).
        // Los endpoints lo usan con @security bearerAuth en sus JSDocs,
        // lo que habilita el botón "Authorize" en Swagger UI
        // para pegar el token y enviarlo en cada request.
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },

        // Grupos de endpoints que aparecen como pestañas/colapsons en la UI.
    // Cada ruta se asigna a un tag con @tags en su JSDoc.

    tags: [
      { name: 'Auth', description: 'Autenticación' },
      { name: 'Pacientes', description: 'Módulo de Recepción' },
      { name: 'Médicos', description: 'Directorio de especialistas' },
      { name: 'Citas', description: 'Agendamiento y atención' },
      { name: 'Reportes', description: 'Análisis de datos para gerencia' },
    ],
  },

   // Glob de archivos donde buscar los comentarios JSDoc con la metadata
  // de cada endpoint (@summary, @tags, @param, @response, @security).
  // Solo escanea archivos que terminen en .routes.ts dentro de modules/.
  apis: ['./src/modules/**/*.routes.ts'],
}

const swaggerSpec = swaggerJsdoc(options)


// Se exportan como arrays / RequestHandlers para que en app.ts se usen así:
//   app.use('/api/docs', ...swaggerDocs, swaggerSetup);
//
// swaggerDocs (array) → middleware que sirve los assets estáticos de la UI
// swaggerSetup        → middleware que renderiza la página HTML con la spec

export const swaggerDocs: RequestHandler[] = swaggerUi.serve
export const swaggerSetup: RequestHandler = swaggerUi.setup(swaggerSpec)