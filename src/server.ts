import app from './app';


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🏥 API Clínica Salud Integral corriendo en http://localhost:${PORT}`);
});         