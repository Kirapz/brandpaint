require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// CORS - тільки один middleware!
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://brandpaint.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
const generateRoute = require('./routes/generate');
const authRoute = require('./routes/auth');
const projectsRoute = require('./routes/projects');

app.use('/api/generate', generateRoute);
app.use('/api/auth', authRoute);
app.use('/api/projects', projectsRoute);

// Health check endpoint для Render
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'BrandPaint API Server', 
    version: '1.0.0',
    endpoints: [
      'GET /health',
      'POST /api/generate',
      'GET /api/auth/profile',
      'PUT /api/auth/profile',
      'GET /api/projects',
      'POST /api/projects',
      'GET /api/projects/:id',
      'PUT /api/projects/:id',
      'DELETE /api/projects/:id'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint not found' 
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});