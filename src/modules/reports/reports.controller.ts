import type { Request, Response } from 'express';
import { reportsService } from './reports.service';
import { z } from 'zod';

const dateQuery = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const reportsController = {
  async volumeBySpecialty(_req: Request, res: Response) {
    const data = await reportsService.volumeBySpecialty();
    res.json(data);
  },

  async dailyReport(req: Request, res: Response) {
    const parsed = dateQuery.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
    const data = await reportsService.dailyReport(parsed.data.date);
    res.json(data);
  },
};   