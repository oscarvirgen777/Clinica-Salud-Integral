// Unión de literales: los tres niveles de log.
// Se usa para tipar el nivel en el prefijo del mensaje.
type Level = 'info' | 'warn' | 'error'

/**
 * LOGGER simple de la aplicación.
 *
 * Wrappa console.log/warn/error con:
 *   - Prefijo de nivel ([INFO], [WARN], [ERROR])
 *   - Timestamp ISO (ej: 2026-11-16T10:30:00.000Z)
 *   - Mensaje
 *   - Meta opcional (objeto con datos extra: id del request, error, etc.)
 *
 * ¿Por qué no usar pino/winston directamente?
 *   - Para este proyecto, console.* es suficiente.
 *   - En producción, se reemplazaría por pino (estructurado, más performático)
 *     o winston (con rotación de archivos, transports, etc.).
 *   - Al tener una capa intermedia (este logger), cambiar a pino en el futuro
 *     solo requiere modificar ESTE archivo, no todo el código que lo usa.
 *
 * Uso:
 *   logger.info('Usuario logueado', { userId: 1, email: 'a@b.com' })
 *   logger.error('Fallo en BD', { error: err.message })
 */
export const logger = {
   /**
   * Nivel INFO: eventos normales del flujo (login, creación de recursos, etc.)
   * @param msg  - Mensaje descriptivo
   * @param meta - Objeto opcional con datos extra (aparece en consola como JSON)
   */
  info(msg: string, meta?: object) {
        // `?? ''`: si meta es undefined, imprime string vacío (evita "undefined" en consola).
    console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, meta ?? '')
  },
   /**
   * Nivel WARN: situaciones inesperadas pero no críticas
   * (ej: token casi por expirar, retry de conexión, recurso casi agotado).
   */
  warn(msg: string, meta?: object) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, meta ?? '')
  },
   /**
   * Nivel ERROR: fallos que requieren atención
   * (ej: excepción no capturada, fallo de BD, error de integración).
   */
  error(msg: string, meta?: object) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, meta ?? '')
  },
}   