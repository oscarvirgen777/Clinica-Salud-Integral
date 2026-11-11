import 'dotenv/config';
import app from './app';
import { logger } from './utils/logger'


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`🏥 API Clínica Salud Integral → http://localhost:${PORT}`);
});   