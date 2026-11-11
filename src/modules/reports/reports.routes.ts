import { Router } from 'express'
import { reportsController } from './reports.controller'
import { authorize } from '../../middlewares/authorize.middleware'

const router: Router = Router()

/**
 * @swagger
 * /api/reports/volume-by-specialty:
 *   get:
 *     tags: [Reportes]
 *     summary: Volumen de citas por especialidad
 *     description: "Reporte de gerencia: total de citas agrupadas por especialidad médica"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de especialidades con su volumen
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   specialty:
 *                     type: string
 *                     example: Cardiología
 *                   total:
 *                     type: integer
 *                     example: 12
 *       403:
 *         description: Solo GERENCIA
 */
router.get('/volume-by-specialty', authorize('GERENCIA'), reportsController.volumeBySpecialty)

/**
 * @swagger
 * /api/reports/daily:
 *   get:
 *     tags: [Reportes]
 *     summary: Corte operativo diario
 *     description: "Cantidad de citas completadas y canceladas en una fecha específica"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2026-11-10"
 *     responses:
 *       200:
 *         description: Corte del día
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 date:
 *                   type: string
 *                   example: "2026-11-10"
 *                 completed:
 *                   type: integer
 *                   example: 5
 *                 cancelled:
 *                   type: integer
 *                   example: 2
 *       403:
 *         description: Solo GERENCIA
 */
router.get('/daily', authorize('GERENCIA'), reportsController.dailyReport)

export default router   