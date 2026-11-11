import express, { type Express } from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import patientsRoutes from './modules/patients/patients.routes';
import doctorsRoutes from './modules/doctors/doctors.routes';
import appointmentsRoutes from './modules/appointments/appointments.routes';
import reportsRoutes from './modules/reports/reports.routes';
import { verifyToken } from './middlewares/auth.middleware';
import { errorHandler } from './middlewares/error.middleware';
import { swaggerDocs, swaggerSetup } from './config/swagger';

const app: Express = express();

app.use(cors());
app.use(express.json());

// Rutas públicas
app.use('/api/auth', authRoutes)
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/docs', swaggerDocs, swaggerSetup)

// verifyToken global
app.use('/api', verifyToken)

// Rutas protegidas
app.use('/api/patients', patientsRoutes)
app.use('/api/doctors', doctorsRoutes)
app.use('/api/appointments', appointmentsRoutes)
app.use('/api/reports', reportsRoutes)

app.use(errorHandler)

export default app