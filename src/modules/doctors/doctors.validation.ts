import { z } from 'zod'

/**
 * Schema para GET /api/doctors?specialty= (query params).
 *
 * `specialty` es el NOMBRE de la especialidad (string),
 * no el id. El service lo usa para filtrar por la relación:
 *   where: { specialty: { name: specialty } }
 *
 * .optional(): si no se pasa, devuelve todos los médicos.
 */
export const listDoctorsQuery = z.object({
  specialty: z.string().optional(),
})
/**
 * Schema para POST /api/doctors (body).
 *
 * `specialtyId` es la FK (number) a la tabla Specialty.
 * Al CREAR un médico se pasa el id (no el nombre) porque
 * es una relación por clave foránea en el schema Prisma.
 *
 * Nota: el email es @unique en el schema → si se duplica,
 * Prisma lanza P2002 (lo captura el controller → 409).
 */
export const createDoctorSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  specialtyId: z.number(), // FK → Specialty.id
})   

// z.infer: extrae el tipo TypeScript del schema automáticamente.
// Se usa en doctors.services.ts para tipar el parámetro de create():
//   async create(data: CreateDoctorInput) { ... }
export type CreateDoctorInput = z.infer<typeof createDoctorSchema>  
// Tipo del query params (se usa si se tipa el parámetro de findAll). 
export type ListDoctorsQuery = z.infer<typeof listDoctorsQuery>