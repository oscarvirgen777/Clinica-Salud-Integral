import { prisma } from '../../config/prisma';
// Tipo inferido desde el schema Zod (doctors.validation.ts).
// Equivalente a: { name: string; specialty: string; email: string; phone: string }
// Se usa para tipar el parámetro sin duplicar la definición.
import type { CreateDoctorInput } from './doctors.validation';

/**
 * SERVICE de médicos: queries a BD.
 *
 * Separación:
 *   - Controller → HTTP + mapeo de errores Prisma (P2002, P2003, P2025)
 *   - Service    → Queries Prisma puras
 */
export const doctorsService = {
   /**
   * Crea un médico en la BD.
   * Si el email ya existe → Prisma lanza P2002 (lo captura el controller).
   */
  async create(data: CreateDoctorInput) {
    return prisma.doctor.create({ data });
  },

  /**
   * Lista médicos, opcionalmente filtrados por especialidad.
   *
   * @param specialty - Si se pasa, filtra por esa especialidad.
   *                    Si es undefined, devuelve todos.
   */
async findAll(specialty?: string) {
  return prisma.doctor.findMany({
      // Ternario condicional:
      //   - Si specialty existe → { specialty: { name: specialty } }
      //   - Si no → undefined (Prisma lo interpreta como "sin filtro")
      //
      // ⚠️ VERIFICAR: `specialty: { name: specialty }` implica que `specialty`
      // es una RELACIÓN (tabla Specialty con campo name).
      // Si en tu schema Prisma `specialty` es un STRING simple (como indica
      // el README: "doctors: id, name, specialty, email, phone"),
      // debería ser: { specialty }  (shorthand de { specialty: specialty })
    where: specialty ? { specialty: { name: specialty } } : undefined,
    
      // include: trae la relación specialty completa.
      // ⚠️ Mismo aviso: si specialty es un string (no una relación),
      // esto daría error en runtime. Solo funciona si hay una tabla
      // Specialty con una relación @relation en el schema.
    include: { specialty: true },
  });
},
 /**
   * Detalle de un médico por id.
   * Devuelve null si no existe (el controller hace el check → 404).
   */
async findById(id: number) {
  return prisma.doctor.findUnique({
    where: { id },
    include: { specialty: true },
  });
},
  /**
   * Elimina un médico por id.
   * - Si no existe → Prisma lanza P2025 (lo captura el controller → 404)
   * - Si tiene citas y la relación es Restrict → Prisma lanza P2003
   *   (lo captura el controller → 409)
   */
  async remove(id: number) {
    return prisma.doctor.delete({ where: { id } });
  },
};  