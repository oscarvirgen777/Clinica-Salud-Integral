import { prisma } from '../../config/prisma'
// Tipo inferido desde el schema Zod (patients.validation.ts).
// Equivalente a: { name: string; email: string; phone: string; dateOfBirth: string; address?: string }
import type { CreatePatientInput } from './patients.validation'
// AppError: se lanza desde el service y es capturado por el error middleware global.
import { AppError } from '../../errors/AppError'

/**
 * SERVICE de pacientes: queries a BD y lógica de negocio.
 */
export const patientsService = {
  
  /**
   * Crea un paciente en la BD.
   * Si el email ya existe → Prisma lanza P2002 (lo captura el controller → 409).
   */
  async create(data: CreatePatientInput) {
    return prisma.patient.create({
      data: {
                // Spread: copia todos los campos (name, email, phone, address).
        ...data,
         // Override: convierte el string ISO a objeto Date.
        // Prisma acepta ambos, pero al convertir explícitamente
        // se garantiza que el formato sea válido antes de insertar.
        // Sin esto, Prisma intentaría parsear el string y podría
        // fallar con formatos no estándar.
        dateOfBirth: new Date(data.dateOfBirth),
      },
    })
  },

  /**
   * Lista todos los pacientes (sin filtros).
   * Devuelve un array de objetos Patient (sin relaciones).
   */
  async findAll() {
    return prisma.patient.findMany()
  },
 /**
   * Expediente completo del paciente: datos personales + historial de citas.
   *
   * @returns El paciente con sus citas (cada cita incluye el doctor),
   *          o null si no existe.
   */
  async findById(id: number) {
  const patient = await prisma.patient.findUnique({
    where: { id },
     // include: trae la relación appointments.
      // Dentro de appointments, include: { doctor: true } →
      // cada cita trae el objeto doctor completo (nombre, especialidad, etc.).
      // orderBy: { date: 'desc' } → la cita más reciente primero.
      //
      // Estructura del resultado:
      // {
      //   id, name, email, phone, dateOfBirth, address, ...
      //   appointments: [
      //     { id, date, status, notes, doctor: { id, name, specialty, ... } },
      //     { id, date, status, notes, doctor: { ... } },
      //   ]
      // }
    include: {
      appointments: {
        include: { doctor: true },
        orderBy: { date: 'desc' },
      },
    },
  })
    // Si no existe → null (el controller lanza NotFoundError → 404).

  if (!patient) return null

   // Transform de dateOfBirth:
    //   - Prisma lo devuelve como Date (ej: 2026-03-15T00:00:00.000Z)
    //   - .toISOString() → "2026-03-15T00:00:00.000Z"
    //   - .split('T')[0] → "2026-03-15" (solo la fecha, sin hora)
    //
    // Se hace en el service (no en el controller) porque es una
    // transformación de datos de negocio, no de HTTP.
  return {
    ...patient,
    dateOfBirth: patient.dateOfBirth.toISOString().split('T')[0],
  }
},

  /**
   * Actualiza un paciente (parcial: solo los campos enviados).
   *
   * @param id   - Id del paciente
   * @param data - Campos a actualizar (todos opcionales por .partial() en Zod)
   *
   * Si el id no existe → Prisma lanza P2025 (lo captura el controller → 404).
   * Si el email es duplicado → Prisma lanza P2002 (lo captura el controller → 409).
   */
 async update(id: number, data: Partial<CreatePatientInput>) {
  return prisma.patient.update({
    where: { id },
    data: {
       // Spread: incluye solo los campos que el cliente envió
        // (los que no están en data no se tocan en la BD).
      ...data,
       // Spread condicional: SOLO si dateOfBirth fue enviado,
        // lo convierte a Date. Si no se envió, no se incluye
        // (Prisma no lo toca en la BD).
        //
        // Truco: `false && {...}` → false → spread de false → nada.
        //        `true && { dateOfBirth: ... }` → el objeto → se spreadea.
      ...(data.dateOfBirth && { dateOfBirth: new Date(data.dateOfBirth) }),
    },
  })
},

  /**
   * Elimina un paciente.
   *
   * Diferencia con doctors.remove:
   *   - doctors → deja que Prisma lance P2003 (reactivo)
   *   - patients → verifica ANTES con count (proactivo)
   *
   * Ambos son válidos. El proactivo da un mensaje más claro
   * y evita que Prisma lance un error de BD que hay que mapear.
   */
  async remove(id: number) {
     // Count: cuántas citas tiene este paciente.
    // Es más eficiente que findMany (solo devuelve un número, no los objetos).
    const appointments = await prisma.appointment.count({ where: { patientId: id } })
    
    // Si tiene citas → 409 (no se puede eliminar).
    // El error middleware global lo responde.
    if (appointments > 0) {
      throw new AppError('No se puede eliminar un paciente con citas registradas', 409)
    }
    // Si no tiene citas → elimina.
    // Si el id no existe → Prisma lanza P2025 (lo captura el controller → 404).
    return prisma.patient.delete({ where: { id } })
  },
}   