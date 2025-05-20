const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const geminiRoutes = require('./src/routes/geminiRoutes');

dotenv.config();

// Initialize app
const app = express();

// Connect to DB
connectDB();

// Middleware
app.use(cors({
  origin: "http://localhost:3000",  // <-- frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/gemini', geminiRoutes);

// Root health check
app.get('/', (req, res) => res.send('🚀 Gemini API is running...'));

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌐 Server running on port ${PORT}`));
