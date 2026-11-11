-- ============================================
-- CLÍNICA SALUD INTEGRAL - SEED
-- ============================================

-- Users (password: "admin123" hasheado con bcrypt)
INSERT INTO "users" ("name", "email", "password", "role") VALUES
  ('Ana Recepcionista', 'ana@clinica.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'RECEPCIONISTA'),
  ('Dr. Carlos', 'carlos@clinica.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'MEDICO'),
  ('Gerente Laura', 'laura@clinica.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'GERENCIA');

-- Doctors
INSERT INTO "doctors" ("name", "specialty", "email", "phone") VALUES
  ('Dr. Carlos Pérez', 'Cardiología', 'carlos.med@clinica.com', '555-0101'),
  ('Dra. María López', 'Dermatología', 'maria.med@clinica.com', '555-0102'),
  ('Dr. Jorge Ramírez', 'Pediatría', 'jorge.med@clinica.com', '555-0103'),
  ('Dra. Sofía Torres', 'Neurología', 'sofia.med@clinica.com', '555-0104'),
  ('Dr. Luis Mendoza', 'Ortopedia', 'luis.med@clinica.com', '555-0105');

-- Patients
INSERT INTO "patients" ("name", "email", "phone", "dateOfBirth", "address") VALUES
  ('Roberto García', 'roberto@email.com', '555-1001', '1985-03-15', 'Av. Reforma 123, CDMX'),
  ('Lucía Fernández', 'lucia@email.com', '555-1002', '1992-07-22', 'Calle Juárez 45, Guadalajara'),
  ('Miguel Sánchez', 'miguel@email.com', '555-1003', '1978-11-03', 'Blvd. Díaz Ordaz 789, Monterrey'),
  ('Paola Hernández', 'paola@email.com', '555-1004', '2001-01-30', 'Av. Insurgentes 56, CDMX'),
  ('Jorge Castillo', 'jorge@email.com', '555-1005', '1995-06-18', 'Calle 5 #123, Mérida');

-- Appointments
INSERT INTO "appointments" ("date", "status", "notes", "patientId", "doctorId") VALUES
  ('2026-11-10 09:00:00', 'COMPLETADA', 'Control cardiaco trimestral', 1, 1),
  ('2026-11-10 10:00:00', 'COMPLETADA', 'Evaluación de eccema', 2, 2),
  ('2026-11-11 08:00:00', 'COMPLETADA', 'Chequeo general pediátrico', 4, 3),
  ('2026-11-11 11:00:00', 'CANCELADA', 'Paciente no asistió', 3, 5),
  ('2026-11-12 09:30:00', 'PROGRAMADA', 'Seguimiento post-quirúrgico', 3, 5),
  ('2026-11-12 14:00:00', 'PROGRAMADA', 'Evaluación neurológica', 5, 4),
  ('2026-11-13 10:00:00', 'PROGRAMADA', 'Control dermatológico', 2, 2),
  ('2026-11-14 08:30:00', 'PROGRAMADA', 'ECG de rutina', 1, 1);   