// Carga las variables de .env en process.env.
// Se importa aquí (punto de entrada) para que estén disponibles
// antes de que cualquier otro módulo lea process.env.
// (También se importa en config/prisma.ts por seguridad,
//  pero el primer import que se ejecuta es el que "activa" dotenv.)
import 'dotenv/config';
// La instancia de Express configurada en app.ts
// (middlewares, rutas, error handler).
import app from './app';
// Logger de la aplicación (para el mensaje de arranque).
import { logger } from './utils/logger'

// Puerto del servidor: lee process.env.PORT o usa 3000 como default.
// En .env se define PORT=3000 (o el que corresponda).
// En Docker, se inyecta por docker-compose.yml.
const PORT = process.env.PORT || 3000;



// Levanta el servidor HTTP y escucha en el puerto indicado.
// El callback se ejecuta UNA vez cuando el servidor está listo.
//
// Nota: no hay manejo de SIGTERM/SIGINT (shutdown gracioso).
// En producción (Docker/K8s), cuando se envía SIGTERM para detener
// el contenedor, Node.js muere inmediatamente sin cerrar conexiones
// pendientes. Mejora opcional:
//   process.on('SIGTERM', () => { server.close(); process.exit(0); })
app.listen(PORT, () => {
  // Mensaje de confirmación en consola con el puerto real.
  logger.info(`🏥 API Clínica Salud Integral → http://localhost:${PORT}`);
});   