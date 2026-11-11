import { Router } from 'express';
import { patientsController } from './patients.controller';
import { verifyToken } from '../../middlewares/auth.middleware'
import { authorize } from '../../middlewares/authorize.middleware'

const router: Router = Router();

router.post('/', verifyToken, authorize('RECEPCIONISTA'), patientsController.create)

router.post('/', verifyToken, authorize('RECEPCIONISTA'), patientsController.create);
router.get('/', verifyToken, patientsController.findAll);
router.get('/:id', verifyToken, patientsController.findById);
router.put('/:id', verifyToken, authorize('RECEPCIONISTA'), patientsController.update);
router.delete('/:id', verifyToken, authorize('RECEPCIONISTA'), patientsController.remove);


/**
 * @swagger
 * /api/patients:
 *   post:
 *     tags: [Pacientes]
 *     summary: Registrar nuevo paciente
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, phone, dateOfBirth]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Roberto García
 *               email:
 *                 type: string
 *                 format: email
 *                 example: roberto@email.com
 *               phone:
 *                 type: string
 *                 example: "555-1001"
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "1985-03-15"
 *               address:
 *                 type: string
 *                 example: Av. Reforma 123, CDMX
 *     responses:
 *       201:
 *         description: Paciente creado
 *       400:
 *         description: Datos inválidos (email mal formateado, fecha futura)
 *       403:
 *         description: Solo RECEPCIONISTA
 */
router.post('/', verifyToken, authorize('RECEPCIONISTA'), patientsController.create);

/**
 * @swagger
 * /api/patients:
 *   get:
 *     tags: [Pacientes]
 *     summary: Listar todos los pacientes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pacientes
 */
router.get('/', verifyToken, patientsController.findAll);

/**
 * @swagger
 * /api/patients/{id}:
 *   get:
 *     tags: [Pacientes]
 *     summary: Expediente completo del paciente
 *     description: Devuelve datos personales + historial de citas con médico
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
 *         description: Expediente del paciente
 *       404:
 *         description: Paciente no encontrado
 */
router.get('/:id', verifyToken, patientsController.findById);

/**
 * @swagger
 * /api/patients/{id}:
 *   put:
 *     tags: [Pacientes]
 *     summary: Actualizar paciente
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
 *         description: Paciente actualizado
 *       403:
 *         description: Solo RECEPCIONISTA
 */
router.put('/:id', verifyToken, authorize('RECEPCIONISTA'), patientsController.update);

/**
 * @swagger
 * /api/patients/{id}:
 *   delete:
 *     tags: [Pacientes]
 *     summary: Eliminar paciente
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
 *         description: Paciente eliminado
 *       403:
 *         description: Solo RECEPCIONISTA
 */
router.delete('/:id', verifyToken, authorize('RECEPCIONISTA'), patientsController.remove);

export default router;