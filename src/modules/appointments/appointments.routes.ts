import { Router } from 'express';
import { appointmentsController } from './appointments.controller';
import { authorize } from '../../middlewares/authorize.middleware'

const router: Router = Router();

router.post('/', authorize('RECEPCIONISTA'), appointmentsController.create);
router.get('/doctor/:doctorId/schedule', authorize('MEDICO'), appointmentsController.doctorSchedule);
router.patch('/:id/status', authorize('MEDICO'), appointmentsController.updateStatus);
router.get('/:id', appointmentsController.findById);

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     tags: [Citas]
 *     summary: Agendar cita
 *     description: Crea una cita con estado PROGRAMADA. No permite fechas pasadas.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patientId, doctorId, date]
 *             properties:
 *               patientId:
 *                 type: integer
 *                 example: 1
 *               doctorId:
 *                 type: integer
 *                 example: 2
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-11-20T10:00:00.000Z"
 *               notes:
 *                 type: string
 *                 example: Control cardiaco
 *     responses:
 *       201:
 *         description: Cita agendada
 *       400:
 *         description: Fecha en el pasado o paciente/médico no encontrado
 *       403:
 *         description: Solo RECEPCIONISTA
 */
router.post('/', authorize('RECEPCIONISTA'), appointmentsController.create);

/**
 * @swagger
 * /api/appointments/doctor/{doctorId}/schedule:
 *   get:
 *     tags: [Citas]
 *     summary: Agenda del médico por rango de fechas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2026-11-10"
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2026-11-15"
 *     responses:
 *       200:
 *         description: Citas del médico en el rango
 *       403:
 *         description: Solo MEDICO
 */
router.get('/doctor/:doctorId/schedule', authorize('MEDICO'), appointmentsController.doctorSchedule);

/**
 * @swagger
 * /api/appointments/{id}/status:
 *   patch:
 *     tags: [Citas]
 *     summary: Actualizar estado de cita
 *     description: Cambia el estado a COMPLETADA o CANCELADA
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [COMPLETADA, CANCELADA]
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       403:
 *         description: Solo MEDICO
 *       404:
 *         description: Cita no encontrada
 */
router.patch('/:id/status', authorize('MEDICO'), appointmentsController.updateStatus);

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     tags: [Citas]
 *     summary: Detalle de una cita
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cita con paciente y médico
 *       404:
 *         description: Cita no encontrada
 */
router.get('/:id', appointmentsController.findById);

export default router;