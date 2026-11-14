import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {

  // 1. BORRAR (orden inverso a las FK)
  await prisma.appointment.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.doctor.deleteMany()
  await prisma.user.deleteMany()
  await prisma.specialty.deleteMany()

  // 2. REINICIAR SECUENCIAS
  await prisma.$executeRaw`ALTER SEQUENCE appointments_id_seq RESTART WITH 1;`
  await prisma.$executeRaw`ALTER SEQUENCE patients_id_seq RESTART WITH 1;`
  await prisma.$executeRaw`ALTER SEQUENCE doctors_id_seq RESTART WITH 1;`
  await prisma.$executeRaw`ALTER SEQUENCE users_id_seq RESTART WITH 1;`
  await prisma.$executeRaw`ALTER SEQUENCE specialties_id_seq RESTART WITH 1;`

  const hashedPassword = await bcrypt.hash('admin123', 10)

  // 3. SPECIALTIES (antes de doctors)
  const specialties = [
    { name: 'Cardiología' },
    { name: 'Dermatología' },
    { name: 'Pediatría' },
    { name: 'Neurología' },
    { name: 'Ortopedia' },
  ]

  for (const s of specialties) {
    await prisma.specialty.create({ data: s })
  }

  const cardiologia = await prisma.specialty.findUnique({ where: { name: 'Cardiología' } })
  const dermatologia = await prisma.specialty.findUnique({ where: { name: 'Dermatología' } })
  const pediatria = await prisma.specialty.findUnique({ where: { name: 'Pediatría' } })
  const neurologia = await prisma.specialty.findUnique({ where: { name: 'Neurología' } })
  const ortopedia = await prisma.specialty.findUnique({ where: { name: 'Ortopedia' } })

  // 4. DOCTORS (con specialtyId)
  await prisma.doctor.createMany({
    data: [
      { name: 'Dr. Carlos Pérez', specialtyId: cardiologia!.id, email: 'carlos.med@clinica.com', phone: '555-0101' },
      { name: 'Dra. María López', specialtyId: dermatologia!.id, email: 'maria.med@clinica.com', phone: '555-0102' },
      { name: 'Dr. Jorge Ramírez', specialtyId: pediatria!.id, email: 'jorge.med@clinica.com', phone: '555-0103' },
      { name: 'Dra. Sofía Torres', specialtyId: neurologia!.id, email: 'sofia.med@clinica.com', phone: '555-0104' },
      { name: 'Dr. Luis Mendoza', specialtyId: ortopedia!.id, email: 'luis.med@clinica.com', phone: '555-0105' },
    ],
  })

  // 5. USERS
  await prisma.user.createMany({
    data: [
      { name: 'Ana Recepcionista', email: 'ana@clinica.com', password: hashedPassword, role: 'RECEPCIONISTA' },
      { name: 'Dr. Carlos', email: 'carlos@clinica.com', password: hashedPassword, role: 'MEDICO', doctorId: 1 },
      { name: 'Gerente Laura', email: 'laura@clinica.com', password: hashedPassword, role: 'GERENCIA' },
    ],
  })

  // 6. PATIENTS
  await prisma.patient.createMany({
    data: [
      { name: 'Roberto García', email: 'roberto@email.com', phone: '555-1001', dateOfBirth: new Date('1985-03-15') },
      { name: 'Lucía Fernández', email: 'lucia@email.com', phone: '555-1002', dateOfBirth: new Date('1992-07-22') },
      { name: 'Miguel Sánchez', email: 'miguel@email.com', phone: '555-1003', dateOfBirth: new Date('1978-11-03') },
      { name: 'Paola Hernández', email: 'paola@email.com', phone: '555-1004', dateOfBirth: new Date('2001-01-30') },
      { name: 'Jorge Castillo', email: 'jorge@email.com', phone: '555-1005', dateOfBirth: new Date('1995-06-18') },
    ],
  })

  // 7. APPOINTMENTS
  await prisma.appointment.createMany({
    data: [
      { date: new Date('2026-11-10T09:00:00'), status: 'COMPLETADA', notes: 'Control cardiaco trimestral', patientId: 1, doctorId: 1 },
      { date: new Date('2026-11-10T10:00:00'), status: 'COMPLETADA', notes: 'Evaluación de eccema', patientId: 2, doctorId: 2 },
      { date: new Date('2026-11-11T08:00:00'), status: 'COMPLETADA', notes: 'Chequeo general pediátrico', patientId: 4, doctorId: 3 },
      { date: new Date('2026-11-11T11:00:00'), status: 'CANCELADA', notes: 'Paciente no asistió', patientId: 3, doctorId: 5 },
      { date: new Date('2026-11-12T09:30:00'), status: 'PROGRAMADA', notes: 'Seguimiento post-quirúrgico', patientId: 3, doctorId: 5 },
      { date: new Date('2026-11-12T14:00:00'), status: 'PROGRAMADA', notes: 'Evaluación neurológica', patientId: 5, doctorId: 4 },
      { date: new Date('2026-11-13T10:00:00'), status: 'PROGRAMADA', notes: 'Control dermatológico', patientId: 2, doctorId: 2 },
      { date: new Date('2026-11-14T08:30:00'), status: 'PROGRAMADA', notes: 'ECG de rutina', patientId: 1, doctorId: 1 },
    ],
  })

  console.log(' Seed completado')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())   