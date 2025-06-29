const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

// Import mood recommendation functionality
const { getMoodBasedRecommendations } = require('./temp/index.js');

const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));

app.use(express.json());

// Socket.io setup with CORS
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Basic route for health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Movie Watch Party Server is running',
    timestamp: new Date().toISOString()
  });
});

// Mood-based recommendation endpoint
app.post('/api/recommendations/mood', async (req, res) => {
  try {
    const { mood, viewingHistory } = req.body;
    
    console.log('Received mood recommendation request:', { mood, viewingHistoryLength: viewingHistory?.length || 0 });
    
    if (!mood || typeof mood !== 'string') {
      console.log('Invalid mood parameter:', mood);
      return res.status(400).json({
        success: false,
        error: 'Mood parameter is required and must be a string'
      });
    }

    console.log('Calling getMoodBasedRecommendations...');
    const result = await getMoodBasedRecommendations(mood, viewingHistory || []);
    console.log('Recommendation result:', result);
    
    // Ensure the result has the required structure
    if (!result || typeof result !== 'object') {
      throw new Error('Invalid result format from recommendation function');
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error in mood recommendation endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Socket connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle room joining
  socket.on('join-room', (roomId, userInfo) => {
    socket.join(roomId);
    socket.broadcast.to(roomId).emit('user-joined', {
      userId: socket.id,
      ...userInfo
    });
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  // Handle video sync events
  socket.on('video-play', (data) => {
    socket.broadcast.to(data.roomId).emit('video-play', data);
  });

  socket.on('video-pause', (data) => {
    socket.broadcast.to(data.roomId).emit('video-pause', data);
  });

  socket.on('video-seek', (data) => {
    socket.broadcast.to(data.roomId).emit('video-seek', data);
  });

  // Handle chat messages
  socket.on('send-message', (data) => {
    socket.broadcast.to(data.roomId).emit('receive-message', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`🚀 Movie Watch Party Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = { app, server, io };
