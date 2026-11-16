# Requerimientos — Clínica Salud Integral

## Entidades y Atributos

### Specialty (Especialidad)

| Atributo | Tipo | Notas |
|----------|------|-------|
| id | Int | [PK], autoincremental |
| name | String | [Único], [Obligatorio] |
| createdAt | DateTime | [Obligatorio], default now() |

### Doctor (Médico)

| Atributo | Tipo | Notas |
|----------|------|-------|
| id | Int | [PK], autoincremental |
| name | String | [Obligatorio] |
| email | String | [Único], [Obligatorio] |
| phone | String | [Obligatorio] |
| specialtyId | Int | [FK → Specialty], [Obligatorio] |
| createdAt | DateTime | [Obligatorio], default now() |
| updatedAt | DateTime | [Obligatorio], auto |

### Patient (Paciente)

| Atributo | Tipo | Notas |
|----------|------|-------|
| id | Int | [PK], autoincremental |
| name | String | [Obligatorio] |
| email | String | [Único], [Obligatorio] |
| phone | String | [Obligatorio] |
| dateOfBirth | DateTime | [Obligatorio] |
| address | String | Opcional |
| createdAt | DateTime | [Obligatorio], default now() |
| updatedAt | DateTime | [Obligatorio], auto |

### Appointment (Cita)

| Atributo | Tipo | Notas |
|----------|------|-------|
| id | Int | [PK], autoincremental |
| date | DateTime | [Obligatorio] |
| status | Enum | [Obligatorio], default PROGRAMADA |
| notes | String | Opcional |
| patientId | Int | [FK → Patient], [Obligatorio] |
| doctorId | Int | [FK → Doctor], [Obligatorio] |
| createdAt | DateTime | [Obligatorio], default now() |
| updatedAt | DateTime | [Obligatorio], auto |

### User (Cuenta de acceso)

| Atributo | Tipo | Notas |
|----------|------|-------|
| id | Int | [PK], autoincremental |
| name | String | [Obligatorio] |
| email | String | [Único], [Obligatorio] |
| password | String | [Obligatorio], hash bcrypt |
| role | Enum | [Obligatorio] (RECEPCIONISTA, MEDICO, GERENCIA) |
| doctorId | Int | [FK → Doctor], Opcional (solo si role = MEDICO) |
| createdAt | DateTime | [Obligatorio], default now() |

---

## Relaciones

- Un **médico** puede tener muchas **citas**, pero una **cita** pertenece a un solo **médico**.
- Un **paciente** puede tener muchas **citas**, pero una **cita** pertenece a un solo **paciente**.
- Un **médico** pertenece a una **especialidad**, pero una **especialidad** puede tener muchos **médicos**.
- Un **médico** puede tener una **cuenta de acceso** (User), pero una **cuenta** pertenece a un solo **médico** (opcional: solo los usuarios con rol MEDICO).

---

## Decisión: ¿Especialidad como string o como tabla?

**Se modela como tabla independiente (`Specialty`).**

Razón: la gerencia necesita listar todas las especialidades que existen, **tengan o no médicos asignados**. Si `specialty` fuera un string repetido en cada médico:

- No se podría listar "Cardiología" como especialidad vacante (sin médicos).
- Un cambio de nombre ("Cardiología" → "Medicina Cardiovascular") requeriría actualizar todas las filas de `doctors`.
- No se podría garantizar que no existan variantes ("Cardiologia", "cardiología", "CARDIOLOGIA").

Con una tabla `Specialty` + FK en `Doctor`:
- Las especialidades vacantes existen como filas independientes.
- El nombre se cambia en un solo lugar.
- El constraint `@unique` en `Specialty.name` evita duplicados.

---

## Nota sobre la tabla User

No aparece en el caso de negocio del cliente (el cliente no habla de "login"). Es un **requisito técnico** de autenticación: la API necesita distinguir quién hace cada acción para aplicar las reglas de rol (RECEPCIONISTA agenda, MEDICO atiende, GERENCIA ve reportes). Se agrega como tabla separada de `Doctor` porque un recepcionista o gerencia NO es un médico.   