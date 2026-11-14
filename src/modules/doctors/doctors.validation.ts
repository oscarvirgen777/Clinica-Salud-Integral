import { z } from 'zod'

export const listDoctorsQuery = z.object({
  specialty: z.string().optional(),
})
export const createDoctorSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  specialtyId: z.number(),
})   

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>   
export type ListDoctorsQuery = z.infer<typeof listDoctorsQuery>