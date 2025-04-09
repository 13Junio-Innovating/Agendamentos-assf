require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const authenticateToken = require('./middleware/auth');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api/auth', authRoutes, authenticateToken);
app.use('/api/users', userRoutes, authenticateToken);
app.use('/api/appointments', appointmentRoutes, authenticateToken);

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rota para servir o frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});