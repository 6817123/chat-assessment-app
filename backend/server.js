const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const chatRoutes = require('./routes/chat');

const app = express();

const parseOrigins = (v) => (v || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const allowedHttp = parseOrigins(process.env.CORS_ORIGIN);



const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedHttp.length === 0 || allowedHttp.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

const healthHandler = (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
};
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

app.use('/api/chat', chatRoutes);


app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is running — Welcome to Chat Assessment API!'
  });
});
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});


const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
});

function graceful(exitCode = 0) {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(exitCode);
  });
  // Fallback timeout
  setTimeout(() => {
    console.warn('Force exit after timeout');
    process.exit(exitCode);
  }, 5000).unref();
}

process.on('SIGTERM', () => graceful(0));
process.on('SIGINT', () => graceful(0));