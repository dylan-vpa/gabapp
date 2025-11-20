const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS para RunPod
const corsOptions = {
  origin: [
    'https://7lxtqv697gvl9l-3000.proxy.runpod.net',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Need to Get API is running');
});

const authRoutes = require('./routes/auth.routes');
const goalRoutes = require('./routes/goal.routes');
const aiRoutes = require('./routes/ai.routes');

app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/ai', aiRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
