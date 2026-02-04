require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const setupWebSocket = require('./websocket');

const app = express();
const server = http.createServer(app);

connectDB();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server running' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/songs', require('./routes/songs'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/generate', require('./routes/generate'));

app.get('/', (req, res) => {
  res.json({
    message: 'Dynamic Music Generator API',
    version: '1.0.0'
  });
});

app.use(notFound);
app.use(errorHandler);

// Setup WebSocket for real-time music generation
setupWebSocket(server);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 WebSocket ready on ws://localhost:${PORT}`);
});
