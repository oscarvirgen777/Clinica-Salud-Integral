import { prisma } from '../../config/prisma'
import { AppError } from '../../errors/AppError'
import { NotFoundError } from '../../errors/NotFoundError'

// Unión de literales: los tres estados posibles de una cita.
// Se define aquí (no en el schema Prisma) porque es el tipo
// que el service acepta como parámetro en updateStatus.
type AppointmentStatus = 'PROGRAMADA' | 'COMPLETADA' | 'CANCELADA'



/**
 * SERVICE de citas: contiene toda la lógica de negocio y las queries a BD.
 *
 * Separación de responsabilidades:
 *   - Controller → HTTP (extrae datos, responde)
 *   - Service    → Negocio (valida reglas, accede a BD)
 *
 * Esto permite testear la lógica sin levantar un servidor Express.
 */
export const appointmentsService = {
    /**
   * Crea una nueva cita.
   *
   * Reglas de negocio:
   *   - El paciente y el médico deben existir (si no → 404)
   *   - La cita nace con estado PROGRAMADA (default del schema Prisma)
   *
   * @param data - Datos ya validados por Zod (createAppointmentSchema)
   * @returns La cita creada con paciente y médico incluidos
   */
  async create(data: { patientId: number; doctorId: number; date: string; notes?: string }) {
  
    // Promise.all: ejecuta ambas queries EN PARALELO (no secuencial).
    // Es más eficiente que dos awaits secuenciales:
    //   await findUnique(patient)  → espera ~2ms
    //   await findUnique(doctor)   → espera ~2ms  → total: ~4ms
    // vs.
    //   Promise.all([patient, doctor]) → total: ~2ms
    //
    // Si alguna query falla (error de BD), la Promise se rechaza
    // y el error sube al error middleware global.
    const [patient, doctor] = await Promise.all([
      prisma.patient.findUnique({ where: { id: data.patientId } }),
      prisma.doctor.findUnique({ where: { id: data.doctorId } }),
    ])
    
    // Verificación de existencia: si el paciente no está en la BD → 404.
    // (Alternativa: usar la FK en el schema Prisma con @relation y dejar
    // que PostgreSQL lance un error de integridad referencial. Pero aquí
    // se prefiere un mensaje claro "Paciente con id X no encontrado"
    // en vez de un error genérico de BD.)
    if (!patient) throw new NotFoundError('Paciente', data.patientId)
    if (!doctor) throw new NotFoundError('Médico', data.doctorId)
    // Crea la cita en la BD.
    return prisma.appointment.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        // new Date(data.date): convierte el string ISO (ej: "2026-11-20T10:00:00.000Z")
        // a un objeto Date que Prisma serializa como TIMESTAMP en PostgreSQL.
        date: new Date(data.date),
        notes: data.notes,
      },
      // include: devuelve la cita CON los objetos relacionados (JOIN).
      // Sin esto, la respuesta solo tendría patientId y doctorId (ids sueltos).
      // Con esto, la respuesta tiene el objeto completo de paciente y médico.

      include: { patient: true, doctor: true },
    })
  },
  /**
   * Agenda del médico por rango de fechas.
   *
   * @param doctorId - Id del médico (ya verificado por ownDoctorResource)
   * @param from     - Fecha inicio del rango (string ISO, validado por Zod)
   * @param to       - Fecha fin del rango (string ISO, validado por Zod)
   * @returns Array de citas ordenadas por fecha ascendente
   */
  async doctorSchedule(doctorId: number, from: string, to: string) {
    return prisma.appointment.findMany({
      where: {
        doctorId, // shorthand: { doctorId: doctorId }
        // Filtro por rango de fechas:
        //   gte = greater than or equal (>=)
        //   lte = less than or equal (<=)
        // Equivalente SQL: WHERE "date" >= $1 AND "date" <= $2
        date: { gte: new Date(from), lte: new Date(to) },
      },
      // Solo incluye paciente (no doctor, porque ya se sabe cuál es: es el logueado).
      // Reduce el payload de la respuesta.
      include: { patient: true },
            // Orden cronológico: la cita más antigua primero.
      orderBy: { date: 'asc' },
    })
  },
 /**
   * Actualiza el estado de una cita (COMPLETADA o CANCELADA).
   *
   * @param id     - Id de la cita (ya verificado por ownAppointment)
   * @param status - Nuevo estado (validado por Zod: solo COMPLETADA | CANCELADA)
   * @returns La cita actualizada con paciente y médico incluidos
   */
  async updateStatus(id: number, status: AppointmentStatus) {
    // Read-before-write: primero verifica que la cita existe.
    // Si no → 404 (mejor que un error genérico de Prisma P2025).
    const appointment = await prisma.appointment.findUnique({ where: { id } })
    if (!appointment) throw new NotFoundError('Cita', id)
  // Actualiza solo el campo status.
    // El resto de los campos (date, patientId, doctorId, notes) no se tocan.
    return prisma.appointment.update({
      where: { id },
      data: { status },
            // Devuelve la cita actualizada con relaciones (para la respuesta HTTP).
      include: { patient: true, doctor: true },
    })
  },
/**
   * Detalle de una cita por id.
   *
   * @param id - Id de la cita
   * @returns La cita con datos mínimos de paciente y médico
   */
async findById(id: number) {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    // select (en vez de include): devuelve SOLO los campos especificados.
      // include → trae el objeto completo de la relación.
      // select → elige campos específicos (más controlado, menos datos).
      //
      // Aquí se elige solo lo necesario para mostrar el detalle:
      //   - Paciente: id, name, phone (no email, no dateOfBirth)
      //   - Médico:  id, name, specialty (no email, no phone)
    include: {
      patient: {
        select: { id: true, name: true, phone: true },
      },
      doctor: {
        select: { id: true, name: true, specialty: true },
      },
    },
  })
  if (!appointment) throw new NotFoundError('Cita', id)
  return appointment
}
}