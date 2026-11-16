import type { Request, Response } from 'express';
import { reportsService } from './reports.service';
import { z } from 'zod';


// Schema inline para GET /api/reports/daily?date=YYYY-MM-DD.
// Se define aquí (no en un archivo .validation separado) porque
// es un solo campo simple y no se reutiliza en otro endpoint.
const dateQuery = z.object({
    // Valida formato YYYY-MM-DD (mismo regex que en patients.validation).
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

/**
 * CONTROLADOR de reportes de gerencia.
 *
 * Solo GERENCIA puede acceder (verificado por authorize en routes).
 * No hay lógica de negocio aquí: solo extrae datos y delega al service.
 */
export const reportsController = {
    /**
   * GET /api/reports/volume-by-specialty
   * Rol: GERENCIA
   * Citas agrupadas por especialidad (volumen total por especialidad).
   *
   * _req con underscore: no se usan params ni query (no hay filtros).
   */
  async volumeBySpecialty(_req: Request, res: Response) {
        // El service hace el GROUP BY por especialidad.
    const data = await reportsService.volumeBySpecialty();
    res.json(data);
  },
 /**
   * GET /api/reports/daily?date=YYYY-MM-DD
   * Rol: GERENCIA
   * Corte operativo diario: totales de citas por estado en una fecha.
   */
  async dailyReport(req: Request, res: Response) {
    // Valida el query param `date` con Zod.
    // Si falta o el formato es inválido → 400.
    const parsed = dateQuery.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
    // Delega al service con la fecha validada.
    const data = await reportsService.dailyReport(parsed.data.date);
    res.json(data);
  },
};   