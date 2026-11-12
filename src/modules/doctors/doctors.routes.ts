import { Router } from 'express';
import { doctorsController } from './doctors.controller';
import { authorize } from '../../middlewares/authorize.middleware'

const router: Router = Router();

router.post('/', authorize('RECEPCIONISTA'), doctorsController.create);
router.get('/', doctorsController.findAll);
router.get('/:id', doctorsController.findById);
router.delete('/:id', authorize('RECEPCIONISTA'), doctorsController.remove);

/**
 * @swagger
 * /api/doctors:
 *   post:
 *     tags: [Médicos]
 *     summary: Registrar nuevo médico
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, specialty, email, phone]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Dr. Carlos Pérez
 *               specialty:
 *                 type: string
 *                 example: Cardiología
 *               email:
 *                 type: string
 *                 format: email
 *                 example: carlos.med555@clinica.com
 *               phone:
 *                 type: string
 *                 example: "555-0101"
 *     responses:
 *       201:
 *         description: Médico creado
 *       403:
 *         description: Solo RECEPCIONISTA
 */
router.post('/', authorize('RECEPCIONISTA'), doctorsController.create);

/**
 * @swagger
 * /api/doctors:
 *   get:
 *     tags: [Médicos]
 *     summary: Listar médicos (con filtro por especialidad)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: specialty
 *         schema:
 *           type: string
 *         description: Filtrar por especialidad médica
 *     responses:
 *       200:
 *         description: Lista de médicos
 */
router.get('/', doctorsController.findAll);

/**
 * @swagger
 * /api/doctors/{id}:
 *   get:
 *     tags: [Médicos]
 *     summary: Detalle de un médico
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
 *         description: Médico encontrado
 *       404:
 *         description: Médico no encontrado
 */
router.get('/:id', doctorsController.findById);

/**
 * @swagger
 * /api/doctors/{id}:
 *   delete:
 *     tags: [Médicos]
 *     summary: Eliminar médico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Médico eliminado
 *       403:
 *         description: Solo RECEPCIONISTA
 */
router.delete('/:id', authorize('RECEPCIONISTA'), doctorsController.remove);

export default router;