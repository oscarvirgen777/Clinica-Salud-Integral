import { prisma } from '../../config/prisma';

/**
 * SERVICE de reportes de gerencia: queries de agregación.
 *
 * No hay lógica de negocio compleja: son consultas de lectura
 * con GROUP BY y COUNT para generar métricas operativas.
 */
export const reportsService = {
   /**
   * Reporte: volumen de citas agrupado por especialidad.
   *
   * Estrategia (2 queries):
   *   1. groupBy doctorId → obtiene el conteo de citas por médico
   *   2. findMany doctors → obtiene la especialidad de cada médico
   *   3. Map → une ambos resultados en memoria
   *
   * ¿Por qué no groupBy directamente por specialty?
   * Porque `specialty` NO es un campo en la tabla `appointments`:
   * es una relación (Appointment → Doctor → Specialty).
   * Prisma no soporta groupBy sobre relaciones, solo sobre campos escalares.
   * Por eso se agrupa por `doctorId` (que SÍ es un campo en appointments)
   * y se resuelve la especialidad en una segunda query.
   *
   * @returns Array de { specialty: string, total: number }
   */

  async volumeBySpecialty() {
    return prisma.appointment.groupBy({
         // Agrupa por doctorId (campo escalar en la tabla appointments).
        // Equivalente SQL: SELECT "doctorId", COUNT(*) FROM appointments GROUP BY "doctorId"

      by: ['doctorId'],
              // _count: { _all: true } → agrega COUNT(*) a cada grupo.
        // Equivalente SQL: COUNT(*) as "_count._all"

      _count: { _all: true },
      // Para obtener la especialidad, usamos $queryRaw o un join

    }).then(async (rows) => {
              // rows = [{ doctorId: 1, _count: { _all: 12 } }, { doctorId: 2, _count: { _all: 5 } }, ...]
              // Extrae los doctorIds únicos para la segunda query

      const doctorIds = rows.map((r) => r.doctorId);
      // Segunda query: obtiene id + specialty de cada médico.
        // select: { specialty: true } → trae la relación Specialty completa
        // (id, name, createdAt) porque specialty es una relación en el schema.

      const doctors = await prisma.doctor.findMany({
        where: { id: { in: doctorIds } },
        select: { id: true, specialty: true },
      });
       // Construye un Map<doctorId, specialty> para lookup O(1).
        // doctors = [{ id: 1, specialty: { id: 1, name: 'Cardiología', ... } }, ...]
        // specialtyMap = Map { 1 → { name: 'Cardiología', ... }, 2 → { name: 'Neurología', ... } }
      const specialtyMap = new Map(doctors.map((d) => [d.id, d.specialty]));

      // Mapea los resultados del groupBy al formato de respuesta:
        // { specialty: "Cardiología", total: 12 }
        //
        // ?? 'Desconocida': si por alguna razón el doctor ya no existe
        // (fue eliminado pero sus citas quedaron), el Map no lo tiene → fallback.
      return rows.map((r) => ({
        specialty: specialtyMap.get(r.doctorId)?.name ?? 'Desconocida',
        total: r._count._all,
      }));
    });
  },
/**
   * Reporte: corte operativo diario.
   *
   * Cuenta citas COMPLETADAS y CANCELADAS en un rango de 24 horas
   * (desde 00:00:00.000 hasta 23:59:59.999 del día indicado).
   *
   * @param date - Fecha en formato YYYY-MM-DD (validada por Zod en el controller)
   * @returns { date, completed, cancelled }
   */
  async dailyReport(date: string) {
        // Construye el inicio del día: 00:00:00.000
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
        // Construye el fin del día: 23:59:59.999
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

// Promise.all: ejecuta ambos counts EN PARALELO (son independientes).
    // Más eficiente que dos awaits secuenciales.
    const [completed, cancelled] = await Promise.all([
       // COUNT de citas COMPLETADAS en el rango.
      // Equivalente SQL:
      //   SELECT COUNT(*) FROM appointments
      //   WHERE status = 'COMPLETADA' AND "date" >= $1 AND "date" <= $2
      prisma.appointment.count({
        where: { status: 'COMPLETADA', date: { gte: start, lte: end } },
      }),
            // COUNT de citas CANCELADAS en el rango.
      prisma.appointment.count({
        where: { status: 'CANCELADA', date: { gte: start, lte: end } },
      }),
    ]);
    // Devuelve el corte con la fecha original (string) y los dos totales.
    return { date, completed, cancelled };
  },
};   