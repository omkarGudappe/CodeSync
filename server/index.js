
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();
const connectDB = require('./db');
const Room = require('./models/Room');
const axios = require('axios');
const usersInRooms = {};
const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://192.168.141.158:3000",
  "http://127.0.0.1:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  preflightContinue: true,
  optionsSuccessStatus: 204
}));

app.use(express.json());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  // Add these configurations:
  pingTimeout: 60000, // Increase ping timeout
  pingInterval: 25000, // Increase ping interval
  connectionStateRecovery: {
    // Enable reconnection with state recovery
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true,
  },
  allowEIO3: true
});

async function getRoomFiles(roomId) {
  const room = await Room.findOne({ roomId });
  console.log("Fetching files for room:", roomId);
  if (!room || !room.files) return [];
  return room.files.map(file => ({
    name: file.name || file.fileName,
    code: file.code,
    language: file.language || "javascript",
  }));
}



io.on('connection', (socket) => {
  console.log("✅ A user connected:", socket.id);

  socket.on('join-room', async ({ roomId , name }) => {
    try {
      // Find or create room
      let room = await Room.findOne({ roomId });
      
      if (!room) {
        console.log('Room not found, creating new room:', roomId);
        room = await Room.create({ 
          roomId,
          files: [{ 
            name: "file1.js", 
            code: "// Start coding...",
            language: "javascript"
          }]
        });
      }

      // Send all files data to client
      socket.join(roomId);
      socket.data.name = name;
      socket.data.roomId = roomId;

        if (!usersInRooms[roomId]) {
          usersInRooms[roomId] = [];
        }

      usersInRooms[roomId].push({ id: socket.id, name });
      io.to(roomId).emit('active-users', usersInRooms[roomId]);
      const filesWithCode = await getRoomFiles(roomId);
      socket.emit("files-data", filesWithCode);    
      console.log(`👥 User ${socket.id} joined room ${roomId}`);
    } catch(err) {
      console.error("❌ Error joining room:", err.message);
      socket.emit("error", "Failed to join room");
    }
  });

  socket.on('create-file', async ({ roomId, fileName, language = "javascript" }) => {
    try {
      const room = await Room.findOne({ roomId });
      if (!room) {
        throw new Error("Room not found");
      }

      // Check if file already exists
      const fileExists = room.files.some(f => f.name === fileName);
      if (fileExists) {
        throw new Error("File already exists");
      }

      // Add new file
      room.files.push({
        name: fileName,
        code: `// Start coding in ${fileName}...`,
        language
      });
      await room.save();

      // Broadcast update to all clients in the room
      // createNewFile(roomId, fileName, language);
      const filesWithCode = await getRoomFiles(roomId);
      io.to(roomId).emit("files-data", filesWithCode);
    } catch(err) {
      console.error("❌ Error creating file:", err.message);
      socket.emit("error", err.message);
    }
  });

  socket.on('code-change', async ({ roomId, fileName, code }) => {
    try {
      // Update database
      const room = await Room.findOne({ roomId });
      if (room) {
        const file = room.files.find(f => f.name === fileName);
        if (file) {
          file.code = code;
          await room.save();
        }
      }
      
      socket.to(roomId).emit("code-update", { fileName, code });
      // updateFileContent(roomId, fileName, code);
      // io.to(roomId).emit("code-update", { fileName, code });
    } catch(err) {
      console.error("❌ Error updating code:", err.message);
      socket.emit("error", "Failed to update code");
    }
  });

    socket.on("delete-file", async ({ roomId, fileName }) => {
    try {
      const room = await Room.findOne({ roomId });
      if (!room) return;

      // Remove file
      room.files = room.files.filter(f => f.name !== fileName);
      await room.save();

      // Notify all clients in the room
      io.to(roomId).emit("files-data", room.files);
    } catch (err) {
      console.error("Error deleting file:", err.message);
    }
  });


  socket.on("disconnect", () => {
    // const { roomId, name } = socket.data || {};
    // if (roomId && usersInRooms[roomId]) {
    //   usersInRooms[roomId] = usersInRooms[roomId].filter(
    //     (user) => user.id !== socket.id
    //   );
    //   io.to(roomId).emit('active-users', usersInRooms[roomId]);
    // }
        for (const roomId in usersInRooms) {
          usersInRooms[roomId] = usersInRooms[roomId].filter(user => user.id !== socket.id);
          // Emit updated user list
          io.to(roomId).emit('active-users', usersInRooms[roomId]);
        }
  });

});

app.post('/run', async (req, res) => {
  const { code, language , input } = req.body;

  const langMap = {
    javascript: 93,
    python: 71,
    cpp: 54,
    java: 62,
  };

  try {
    const response = await axios.post(
      'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', 
      {
        source_code: code,
        language_id: langMap[language] || 93,
        stdin: input || '',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        }
      }
    );
  const { stdout, stderr, compile_output } = response.data;

  let output = '';
  if (compile_output) output = compile_output;
  else if (stderr) output = stderr;
  else if (stdout) output = stdout;
  else output = 'No output returned.';

  res.json({ output });

  } catch(err) {
    console.error("❌ Error running code:", err.message);
    res.status(500).json({ error: "Failed to run code" });
  }
});

const PORT = 4000;
connectDB();
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://127.0.0.1:${PORT}`);
});