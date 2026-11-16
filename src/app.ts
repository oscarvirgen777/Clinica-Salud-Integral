import express, { type Express } from 'express';
// cors: habilita Cross-Origin Resource Sharing.
// Sin esto, un frontend en otro puerto/origen no podría hacer requests a la API.
// En producción se configuraría con origin específico (no *).
import cors from 'cors';

// Routers de cada módulo (definidos en sus archivos .routes.ts).
import authRoutes from './modules/auth/auth.routes';
import patientsRoutes from './modules/patients/patients.routes';
import doctorsRoutes from './modules/doctors/doctors.routes';
import appointmentsRoutes from './modules/appointments/appointments.routes';
import reportsRoutes from './modules/reports/reports.routes';

// Middleware de autenticación: se aplica globalmente a /api (ver más abajo).
import { verifyToken } from './middlewares/auth.middleware';
// Error middleware global: SIEMPRE al final (captura todos los throws/rejects).
import { errorHandler } from './middlewares/error.middleware';
// Swagger UI: assets estáticos + página HTML con la spec.
import { swaggerDocs, swaggerSetup } from './config/swagger';

const app: Express = express();

// ─── Middlewares globales (se aplican a TODAS las rutas) ──────────────────

// cors(): permite requests cross-origin (necesario si el frontend está en otro puerto).
app.use(cors());

// express.json(): parsea el body JSON de los requests.
// Sin esto, req.body sería undefined en POST/PUT/PATCH.
app.use(express.json());

// ─── Rutas PÚBLICAS (no requieren token) ───────────────────────────────────
// Se montan ANTES de verifyToken para que no pasen por el middleware de auth.

// POST /api/auth/login → genera el JWT (es el endpoint que OTORGA el token).
app.use('/api/auth', authRoutes)

// GET /api/health → health check para Docker/Kubernetes/load balancers.
// Responde 200 { status: 'ok' } sin lógica de negocio.
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

// GET /api/docs → Swagger UI interactiva (documentación de la API).
// swaggerDocs (array) se expande con ... para servir los assets estáticos.
// swaggerSetup renderiza la página HTML con la spec generada.
app.use('/api/docs', swaggerDocs, swaggerSetup)

// ─── AUTENTICACIÓN GLOBAL ──────────────────────────────────────────────────
// apply verifyToken a TODO lo que viene bajo /api a partir de esta línea.
// Las rutas públicas de arriba (auth, health, docs) NO pasan por aquí
// porque Express evalúa los middlewares en orden: si una ruta ya fue
// resuelta arriba, no llega a este app.use.
//
// Esto significa que en los routers de patients/doctors/appointments/reports
// NO hace falta poner verifyToken en cada ruta (ya está aplicado aquí).
app.use('/api', verifyToken)

// ─── Rutas PROTEGIDAS (requieren token válido) ─────────────────────────────
// Cada router solo agrega authorize(rol) y validate(schema) según corresponda.
app.use('/api/patients', patientsRoutes)
app.use('/api/doctors', doctorsRoutes)
app.use('/api/appointments', appointmentsRoutes)
app.use('/api/reports', reportsRoutes)

// ─── ERROR MIDDLEWARE GLOBAL (SIEMPRE al final) ────────────────────────────
// Captura cualquier throw/reject que no haya sido manejado antes.
// Debe ser el ÚLTIMO middleware montado: si estuviera antes,
// no capturaría errores de las rutas que van después.
app.use(errorHandler)

export default app