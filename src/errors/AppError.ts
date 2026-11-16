/**
 * Clase base de todos los errores de aplicación.
 *
 * Hereda de Error nativa para mantener el stack trace,
 * pero agrega metadatos que el error middleware global
 * necesita para construir la respuesta HTTP.
 */
export class AppError extends Error {
  constructor(
    // Mensaje descriptivo que se envía al cliente
    // (ej: "Email ya registrado", "Cita no encontrada")
    public readonly message: string,
       // Código HTTP que debe devolver la respuesta.
    // Default 500 (Internal Server Error) para errores
    // no especificados, pero cada subclase lo sobreescribe:
    //   NotFoundError     → 404
    //   UnauthorizedError → 401
    public readonly statusCode: number = 500,
    
    // Distingue errores "operacionales" (esperados, controlados)
    // de errores "programación" (bugs).
    // - true  → el error middleware lo maneja con el statusCode indicado
    // - false → el error middleware lo trata como 500 genérico
    //           (no expone el mensaje al cliente, solo loggea)
    public readonly isOperational: boolean = true
  ) {
        // Llama al constructor de Error nativo (setea this.message)

    super(message)

    
    // FIX de herencia en TypeScript:
    // Cuando TS transpila `class X extends Error`, el prototype
    // queda "roto" (instanceof AppError devuelve false).
    // new.target.prototype es el prototype de la clase real
    // (AppError o una subclase como NotFoundError).
    // Esto restaura la cadena de prototipos correcta.
    Object.setPrototypeOf(this, new.target.prototype)
       // Captura el stack trace DESDE esta línea, no desde el inicio
    // del constructor. Así el stack no incluye las líneas internas
    // del constructor (super, setPrototypeOf) y muestra directamente
    // dónde se lanzó el error (el `throw new AppError(...)`).
    Error.captureStackTrace(this, this.constructor)
  }
}   