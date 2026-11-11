-- ============================================
-- CLÍNICA SALUD INTEGRAL - SCHEMA
-- ============================================

-- Enums
CREATE TYPE "Role" AS ENUM ('RECEPCIONISTA', 'MEDICO', 'GERENCIA');
CREATE TYPE "AppointmentStatus" AS ENUM ('PROGRAMADA', 'COMPLETADA', 'CANCELADA');

-- ============================================
-- TABLA: USERS (autenticación)
-- ============================================
CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "password" VARCHAR(255) NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'RECEPCIONISTA',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

-- ============================================
-- TABLA: PATIENTS
-- ============================================
CREATE TABLE "patients" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "phone" VARCHAR(20) NOT NULL,
  "dateOfBirth" TIMESTAMP(3) NOT NULL,
  "address" VARCHAR(500),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

-- ============================================
-- TABLA: DOCTORS
-- ============================================
CREATE TABLE "doctors" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "specialty" VARCHAR(100) NOT NULL,
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "phone" VARCHAR(20) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

-- ============================================
-- TABLA: APPOINTMENTS
-- ============================================
CREATE TABLE "appointments" (
  "id" SERIAL PRIMARY KEY,
  "date" TIMESTAMP(3) NOT NULL,
  "status" "AppointmentStatus" NOT NULL DEFAULT 'PROGRAMADA',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "patientId" INTEGER NOT NULL,
  "doctorId" INTEGER NOT NULL,

  CONSTRAINT "appointments_patientId_fkey"
    FOREIGN KEY ("patientId") REFERENCES "patients"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "appointments_doctorId_fkey"
    FOREIGN KEY ("doctorId") REFERENCES "doctors"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX "idx_appointments_date" ON "appointments"("date");
CREATE INDEX "idx_appointments_status" ON "appointments"("status");
CREATE INDEX "idx_appointments_doctorId" ON "appointments"("doctorId");
CREATE INDEX "idx_appointments_patientId" ON "appointments"("patientId");
CREATE INDEX "idx_doctors_specialty" ON "doctors"("specialty");
CREATE INDEX "idx_patients_email" ON "patients"("email");   