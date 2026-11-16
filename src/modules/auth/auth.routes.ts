import { Router } from 'express'
// El handler de login (controller).
// Nota: no se monta verifyToken aquí porque /login es PÚBlico
// (es el endpoint que OTORGA el token, no uno que lo consume).
import { login } from '../auth/auth.controller'


const router: Router = Router()

// Única ruta del módulo: POST /api/auth/login
// Sin middlewares de auth/authorize (es el endpoint público que genera el token).
// El controller (o model) lanza AppError(401) si las credenciales son inválidas,
// y el error middleware global lo convierte en la respuesta 401.
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Iniciar sesión
 *     description: Autentica un usuario y devuelve un token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: ana@clinica.com
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id: { type: integer }
 *                     name: { type: string }
 *                     role: { type: string, enum: [RECEPCIONISTA, MEDICO, GERENCIA] }
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', login)

export default router;