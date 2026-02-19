const express = require('express');
const cors = require('cors');
require('dotenv').config();

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger.json');

const { promisePool } = require('./config/database');
const createAllTables = require('./initTables'); 
const authenticateToken = require('./middleware/auth');

const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const treatmentRoutes = require('./routes/treatmentRoutes');
const therapistRoutes = require('./routes/therapistRoutes');
const memberRoutes = require('./routes/memberRoutes');
const productRoutes = require('./routes/productsRoute');
const reviewsRoutes = require('./routes/reviewsRoutes');
const articlesRoutes = require('./routes/articlesRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With','Accept']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// optional DB init (if file exists) - COMMENTED OUT UNTUK PRODUCTION
// if (createAllTables && typeof createAllTables === 'function') {
//   createAllTables(promisePool).catch(err => console.error('Init tables error:', err));
// }

// Public routes (no token required)
app.use('/api/auth', authRoutes);
app.use('/api/treatments', treatmentRoutes);
app.use('/api/therapists', therapistRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewsRoutes); // Register route sekali saja
app.use('/api/articles', articlesRoutes);

// Protected routes (require token)
app.use('/api/appointments', authenticateToken, appointmentRoutes);
app.use('/api/members', authenticateToken, memberRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Mochint Beauty Clinic API', version: '1.0' });
});

app.get('/health', async (req, res) => {
  try {
    await promisePool.query('SELECT 1');
    res.json({ status: 'OK', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', database: 'disconnected' });
  }
});

// Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));