import { prisma } from '../../config/prisma';

export const reportsService = {
  // Reporte: volumen de citas agrupado por especialidad
  async volumeBySpecialty() {
    return prisma.appointment.groupBy({
      by: ['doctorId'],
      _count: { _all: true },
      // Para obtener la especialidad, usamos $queryRaw o un join
    }).then(async (rows) => {
      const doctorIds = rows.map((r) => r.doctorId);
      const doctors = await prisma.doctor.findMany({
        where: { id: { in: doctorIds } },
        select: { id: true, specialty: true },
      });
      const specialtyMap = new Map(doctors.map((d) => [d.id, d.specialty]));

      return rows.map((r) => ({
        specialty: specialtyMap.get(r.doctorId) ?? 'Desconocida',
        total: r._count._all,
      }));
    });
  },

  // Reporte: corte operativo diario
  async dailyReport(date: string) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const [completed, cancelled] = await Promise.all([
      prisma.appointment.count({
        where: { status: 'COMPLETADA', date: { gte: start, lte: end } },
      }),
      prisma.appointment.count({
        where: { status: 'CANCELADA', date: { gte: start, lte: end } },
      }),
    ]);

    return { date, completed, cancelled };
  },
};   