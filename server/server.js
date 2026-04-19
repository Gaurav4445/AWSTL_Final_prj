const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST", "PUT", "DELETE"] }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Make io accessible in controllers
app.set('io', io);

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/records', require('./routes/records'));
app.use('/api/vendors', require('./routes/vendors'));
app.use('/api/notifications', require('./routes/notifications')); // ← NEW

app.get('/', (req, res) => res.json({ success: true, message: 'GharSeva API is running!' }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

// Socket.io connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinUserRoom', (userId) => {
    socket.join(`user_${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

module.exports = { io }; // for use in controllers