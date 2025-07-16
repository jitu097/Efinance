const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables first
dotenv.config();

// Initialize Express app
const app = express();

// Import config after dotenv is loaded
const { connectDB, port, corsOrigin } = require('./config');

// Connect to database and start server
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // Middleware - Support multiple CORS origins
    const allowedOrigins = corsOrigin.split(',').map(origin => origin.trim());
    
    app.use(cors({
      origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true
    }));
    app.use(express.json());

    // Routes with error handling
    try {
      app.use('/api/users', require('./routes/users'));
      app.use('/api/transactions', require('./routes/transactions'));
      app.use('/api/expenses', require('./routes/expenses'));
      app.use('/api/investments', require('./routes/investments'));
      console.log('✅ All routes loaded successfully');
    } catch (routeError) {
      console.error('❌ Error loading routes:', routeError.message);
      throw routeError;
    }

    // Test route
    app.get('/api/test', (req, res) => {
      res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
    });

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ 
        status: 'OK', 
        message: 'E-Finance API is running',
        database: 'Connected'
      });
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ error: 'Something went wrong!' });
    });

    // Handle 404 routes
    app.use('*', (req, res) => {
      res.status(404).json({ error: 'Route not found' });
    });

    // Start server
    app.listen(port, () => {
      console.log(`✅ Server Started at http://localhost:${port}`);
      console.log(`🔍 Health check: http://localhost:${port}/health`);
      console.log(`🧪 Test endpoint: http://localhost:${port}/api/test`);
      console.log(`📊 Available routes:`);
      console.log(`   - GET/POST http://localhost:${port}/api/users`);
      console.log(`   - GET/POST http://localhost:${port}/api/transactions`);
      console.log(`   - GET/POST http://localhost:${port}/api/expenses`);
      console.log(`   - GET/POST http://localhost:${port}/api/investments`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();