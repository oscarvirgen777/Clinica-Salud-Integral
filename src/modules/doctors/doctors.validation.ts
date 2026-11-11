import { z } from 'zod'

export const listDoctorsQuery = z.object({
  specialty: z.string().optional(),
})
export const createDoctorSchema = z.object({
  name: z.string().min(1),
  specialty: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
})

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>   
export type ListDoctorsQuery = z.infer<typeof listDoctorsQuery>