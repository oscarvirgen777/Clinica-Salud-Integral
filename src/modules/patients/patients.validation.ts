import { z } from 'zod';

export const createPatientSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  email: z.string().email('Correo electrónico inválido'),
  phone: z.string().min(7, 'Teléfono demasiado corto'),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido (usa YYYY-MM-DD)')
    .refine((val) => new Date(val) < new Date(), {
      message: 'La fecha de nacimiento no puede estar en el futuro',
    }),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;   