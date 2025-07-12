const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();
const connectDB = require('./db');
const Room = require('./models/Room');
const Feedback = require('./models/FeedBack')
const axios = require('axios');
const usersInRooms = {};
const roomAdmin = {};
const roomPending = {};
const activeUsers = {};
const { scheduleRoomDeletion } = require('./roomStore');
const { markSaved } = require('./roomStore');
const userLastSeen = new Map();
const app = express();
const runPythonCodeWithInput = require('./runCodeWithDocker');
const allowedRoomCreations = new Set();

const allowedOrigins = [
  "https://codesync-gray.vercel.app",
  "https://663d-152-59-10-193.ngrok-free.app",
  "http://localhost:3000",
];

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.indexOf(origin) === -1) {
//       const msg = `The CORS policy for this site does not allow access from ${origin}`;
//       return callback(new Error(msg), false);
//     }
//     return callback(null, true);
//   },
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   preflightContinue: true,
//   optionsSuccessStatus: 204
// }));

app.use(cors({
  origin: allowedOrigins,  // Use the array directly
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  preflightContinue: true,
  optionsSuccessStatus: 204
}));

// app.use(cors({
//   origin: "http://localhost:3000", // Your React app's origin
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
// }));

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

const getActiveUsers = (roomId) => {
  return Object.values(activeUsers).filter(user => user.roomId === roomId);
};

const languageBoilerplates = {
  "java": `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, world!");\n    }\n}`,
  "python": `def main():\n    print("Hello, world!")\n\nif __name__ == "__main__":\n    main()`,
  "html": `<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n\t<meta charset=\"UTF-8\">\n\t<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n\t<title>Document</title>\n\t<style>\n\t\t/* Write Styling Here */\n\t</style>\n</head>\n<body>\n\n</body>\n<script>\n\t// Write JavaScript Here\n</script>\n</html>`,
  "cpp": `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, world!" << endl;\n    return 0;\n}`,
  "c": `#include <stdio.h>\n\nint main() {\n    printf("Hello, world!\\n");\n    return 0;\n}`,
  "javascript": `console.log("Hello, world!");`,
  "rust" : `fn main(){\n println!("Hello, world!"); \n}`,
  "ruby" : `def main\n  puts "Hello, world!"\nend\nmain`,
  "go" : `package main\n\nimport "fmt"\n\nfunc main() {\tfmt.Println("Hello, world!")\n}`,
  "php" : `<?php\n\techo "Hello, world!";\n?>`,
  "typescript" : `function greet(name: string): void {\n\tconsole.log(\`Hello, \${name}!\`);\n}\n\ngreet("world");`,
  "csharp": `using System;\n\nclass Program {\n    static void Main(string[] args) {\n        Console.WriteLine("Hello, world!");\n    }\n}`,
  "dart": `void main() {\n  print('Hello, world!');\n}`,
  "swift": `import Foundation\n\nprint("Hello, world!")`,
  "sql": `-- Sample SQL Boilerplate\nSELECT "Hello, world!" AS message;`
};

const getLanguageFromFileName = (fileName) => {
  console.log("File selected" , fileName)
  if (!fileName) return null;
  if (fileName.endsWith(".java")) return "java";
  if (fileName.endsWith(".py")) return "python";
  if (fileName.endsWith(".html")) return "html";
  if (fileName.endsWith(".cpp")) return "cpp";
  if (fileName.endsWith(".c")) return "c";
  if (fileName.endsWith(".js")) return "javascript";
  if (fileName.endsWith(".css")) return "css";
  if (fileName.endsWith(".rs")) return "rust";
  if (fileName.endsWith(".rb")) return "ruby";
  if (fileName.endsWith(".go")) return "go";
  if (fileName.endsWith(".php")) return "php";
  if (fileName.endsWith(".ts")) return "typescript";
  if (fileName.endsWith(".cs")) return "csharp";
  if (fileName.endsWith(".dart")) return "dart";
  if (fileName.endsWith(".swift")) return "swift";
  if (fileName.endsWith(".sql")) return "sql";
  return "plaintext";
};

// app.post('/api/allow-create' , (req , res) => {
//   console.log("passing response")
//   const { roomId } = req.body;
//   allowedRoomCreations.add(roomId);
//   setTimeout(() => allowedRoomCreations.delete(roomId), 60 * 1000);
//   res.send({allowed : true})
//   console.log("allowed True");
// })

app.post("/api/allow-create", (req, res) => {
  const { ROOMID } = req.body;
  console.log("Allowing room creation for:", ROOMID);
  allowedRoomCreations.add(ROOMID);
  // Set a timeout to clean up (optional)
  setTimeout(() => allowedRoomCreations.delete(ROOMID), 60 * 1000);
  res.json({ allowed: true });
});

app.post("/api/feedback" , async (req , res) => {
  const { message , name , tooltip} = req.body;

  if(!message) return res.status(400).json({error : "Feedback is Empty"})

  try{
    await Feedback.create({
      message,
      userName :name,
      EmojiToolTip: tooltip,
      timestamp: new Date()
    });
    res.status(200).json({success:true})
  }catch(err){
    console.error("Feedback error:", err.message);
    res.status(500).json({ error: `Something went wrong : ${err.message}` });
  }
})


setInterval(()=>{
  io.emit("ping-room")
} ,  2 * 60 * 1000)

setInterval(() => {
  const now = Date.now();

  for (const [userId, lastSeen] of userLastSeen.entries()) {
    const socket = io.sockets.sockets.get(userId);

    // Skip if socket doesn't exist (user disconnected)
    if (!socket) {
      userLastSeen.delete(userId);
      continue;
    }

    const inAnyRoom = [...socket.rooms].some(room => room !== userId); // userId = default socket room

    const isTrulyStale = (now - lastSeen > 30000) && !inAnyRoom;

    if (isTrulyStale) {
      console.log(`[STALE USER DISCONNECTED]: ${userId}`);
      userLastSeen.delete(userId);
      io.to(userId).emit("user-stale-disconnected", userId);
    }
  }
}, 2.5 * 60 * 1000);



io.on('connection', (socket) => {
  console.log("✅ A user connected:", socket.id);

  socket.on("final-join", async ({ roomId, name }) => {
  console.log(`[FINAL JOIN] ${name} joined room ${roomId}`);
  socket.join(roomId);
  socket.data.name = name;
  socket.data.roomId = roomId;
  activeUsers[socket.id] = { id: socket.id, name, roomId };

  try {
    const room = await Room.findOne({ roomId });
    if (room) {
      // socket.emit("files-data", room.files);
      const filesWithCode = await getRoomFiles(roomId);
      console.log('FILES SENT TO CLIENT:', filesWithCode);
      socket.emit("files-data", filesWithCode);

      socket.emit("active-users", usersInRooms[roomId] || []);
      console.log("To cheak File are sent or not 🗄️:")
      io.to(roomId).emit("active-users", getActiveUsers(roomId));
      io.to(roomId).emit('admin-info', roomAdmin);
      console.log(`[FINAL JOIN] ${name} joined room ${roomId}`);
  }
  } catch (err) {
    console.warn(`[FINAL JOIN] No room found for ${roomId}`);
  }
});


  socket.on('join-room', async ({ roomId , name , isCreator}) => {
    try {

      // Find or create room
      let room = await Room.findOne({ roomId });
      // if (!room) {
      //   console.log('Room not found, creating new room:', roomId);
      //   room = await Room.create({
      //     roomId,
      //     files: [{ 
      //       name: "file1.js", 
      //       code: "// Start coding...",
      //       language: "javascript"
      //     }]
      //   });
      //   io.to(socket.id).emit('room-joined', ({status:'NOT'}))
      // }

        if (!room) {
      if (!isCreator || !allowedRoomCreations.has(roomId)) {
        socket.emit("join-denied", { reason: "Unauthorized room creation" });
        return;
      }
      
      console.log('Creating new room:', roomId);
      room = await Room.create({
        roomId,
        files: [{ 
          name: "file1.js", 
          code: "// Start coding...",
          language: "javascript"
        }]
      });
      
      // Remove from allowed creations
      allowedRoomCreations.delete(roomId);
    }

      const finalRoom = await Room.findOne({ roomId });

      if (!finalRoom) {
        socket.emit("join-denied", { reason: "Room does not exist." });
        console.log("Room Does not exist");
        return;
      }

        const usersInRoom = Object.values(activeUsers).filter(user => 
          user.roomId === roomId && user.name === name
        );

        if (usersInRoom.length > 0) {
          console.log(`User ${name} already exists in room ${roomId}`);
          io.to(socket.id).emit('room-joined', {status:'Already-exist'});
          return;
        }

          // roomId.files.push({
          //   name: "file1.js", 
          //   code: "// Start coding...",
          //   language: "javascript"
          // })
      //  io.to(roomId).emit("NewJoin" , ({name:socket.data.name}))

      // Send all files data to client
      socket.data.name = name;
      socket.data.roomId = roomId;

      io.to(roomId).emit('active-users', usersInRooms[roomId]);
      console.log("To chaek is Creater or not :" , isCreator)

      if(isCreator){

        const cheack = await Room.findOne({roomId});

        // if(!cheack){
        //   console.log('Room not found, creating new room:', roomId);
        //   room = await Room.create({
        //     roomId,
        //     files: [{ 
        //       name: "file1.js", 
        //       code: "// Start coding...",
        //       language: "javascript"
        //     }]
        //   });
        // }

        scheduleRoomDeletion(roomId, io);

         roomAdmin[roomId] = {socketId:socket.id , name: name};
         console.log("RoomId : " ,roomAdmin[roomId]);
         socket.emit("room-joined" , ({status:"admin"}))
         socket.join(roomId);


          if (!usersInRooms[roomId]) usersInRooms[roomId] = [];
            usersInRooms[roomId] = usersInRooms[roomId].filter(u => u.name !== name);
            usersInRooms[roomId].push({ id: socket.id, name });
            io.to(roomId).emit("active-users", getActiveUsers(roomId));
            io.to(roomId).emit("NewJoin", { name });
            const filesWithCode = await getRoomFiles
            (roomId);
            socket.emit("files-data", filesWithCode);
            console.log(`👥 Admin ${socket.id} joined room ${roomId}`);
          
        }else{
        const adminSoketId = roomAdmin[roomId];
        console.log("Hi from the admin cheak")
        if(adminSoketId){
          roomPending[roomId] = roomPending[roomId] || [];
          roomPending[roomId].push(socket.id);
          console.log("Admin Socket Id" ,adminSoketId);
          io.to(adminSoketId.socketId).emit("join-request" ,{
            requesterId : socket.id,
            name,
          })
        }else{
          socket.emit("room-join-failed" , {reason:"Room Not Available"})
        }
      }
      
      if (!usersInRooms[roomId]) {
        usersInRooms[roomId] = [];
      }
      
    } catch(err) {
      console.error("❌ Error joining room:", err.message);
      socket.emit("error", "Failed to join room");
    }
  });

  socket.on("pong-room", (userId) => {
    userLastSeen.set(userId, Date.now());
  });

   socket.on('mark-room-saved' , async ({roomId}) => {
    const room = await Room.findOneAndUpdate(
      { roomId },
      { isSaved: true },
      { new: true }
    );
    markSaved(roomId);
    console.log("Room marked as saved:", roomId);
   })

   socket.on("delete-room" , async (roomId)=>{
    console.log("Deleting this room" , roomId);
    try{
      const room = await Room.findOne({ roomId });

      if(!room){
        throw new Error(`${roomId} This room is already deleted`);
      }

      await Room.deleteOne({ roomId });

    }catch(err){
      socket.emit("error" , err.message);
    }
   })
  
  socket.on("respond-join" , async ({requesterId , accepted }) => {
      const roomId = socket.data.roomId;
      if(accepted){
        io.to(requesterId).emit("room-joined" , {status : "accepted"})
        const joiner = io.sockets.sockets.get(requesterId);
        if(joiner){
          joiner.join(socket.data.roomId);
          if (!usersInRooms[roomId]) usersInRooms[roomId] = [];
            usersInRooms[roomId] = usersInRooms[roomId].filter(u => u.name !== joiner.data.name);
            usersInRooms[roomId].push({ id: requesterId, name: joiner.data.name });
            socket.emit("active-users", usersInRooms[roomId] || []);
            io.to(roomId).emit("active-users", getActiveUsers(roomId));
            io.to(roomId).emit("NewJoin", { name: joiner.data.name });
            io.to(roomId).emit('admin-info', roomAdmin);
            const filesWithCode = await getRoomFiles(roomId);
            joiner.emit("files-data", filesWithCode);
            console.log(`👥 User ${socket.id} joined room ${roomId}`);
          }
      }else{
        io.to(requesterId).emit("room-joined" , ({status:"Rejected by admin"}))
      }
  })

  socket.on('create-file', async ({ roomId, fileName, language = "javascript" }) => {
    try {
      const room = await Room.findOne({ roomId });
      if (!room) {
        throw new Error("Room not found");
      }


      const fileExists = room.files.some(f => f.name === fileName);
      if (fileExists) {
        throw new Error(`"${fileName}". This file already exists`);
      }

    const lang = getLanguageFromFileName(fileName);
    const baseName = fileName.split('.')[0];
    let boilerPlate = languageBoilerplates[lang] || "//Start coding...";

    if(lang === 'html'){
      const cssName = `${baseName}.css`;
      const jsName = `${baseName}.js`;

      const cssExist = room.files.some(f => f.name === cssName);
      const jsExist = room.files.some(f => f.name === jsName);

      if(!cssExist){
        room.files.push({
          name: cssName,
          code : `/* ${cssName} */\n`,
          language : "css",
        })
      }
      if(!jsExist){
        room.files.push({
          name:jsName,
          code : `// ${jsName}\n`,
          language : "javascript",
        })
      }
      boilerPlate = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${baseName}</title>
    <link rel="stylesheet" href="${cssName}" />
  </head>
  <body>

  <script src="${jsName}"></script>
  </body>
</html>`;
    }

      // Add new file
      room.files.push({
        name: fileName,
        code: boilerPlate,
        language
      });
      await room.save();

      // createNewFile(roomId, fileName, language);
        io.to(roomId).emit("file-created-toast", {
            name: socket.data.name || 'Someone',
            fileName,
          });
        console.log(`[TOAST] ${socket.userName} created ${fileName}`);
      // Broadcast update to all clients in the room
      // createNewFile(roomId, fileName, language);
      const filesWithCode = await getRoomFiles(roomId);
      io.to(roomId).emit("files-data", filesWithCode);
      io.to(socket.id).emit("file-created-confirmed", { fileName });
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

   socket.on('chat-message' , ({roomId , message , name}) => {
     io.to(roomId).emit('chat-message' , {
      message,
      name ,
      timestamp : new Date().toISOString(),
     });
   });

   socket.on('remove-user' , ({roomId , userId}) => {
    console.log("Removing user from room:", userId, "in room:", roomId);
     const userSocket = io.sockets.sockets.get(userId);
     if(userSocket){
       userSocket.leave(roomId);
        io.to(userId).emit("kicked-from-room");
        console.log(`User ${userId} has been removed from room ${roomId}`);
        // Remove user from active users
        delete activeUsers[userId];
        
        if(usersInRooms[roomId]){
          usersInRooms[roomId] = usersInRooms[roomId].filter(user => user.id !== userId);
          io.to(roomId).emit('active-users', usersInRooms[roomId]);
        }
        io.to(roomId).emit('active-users', usersInRooms[roomId]);
     }
   })

   socket.on("leave-room" , ({roomId , name}) => {
    try{
      delete activeUsers[socket.id];

      if(usersInRooms[roomId]){
        usersInRooms[roomId] = usersInRooms[roomId].filter(u => u.id !== socket.id);
        console.log("Person Leved room : " , name);

        io.to(roomId).emit("active-users" , usersInRooms[roomId]);
        io.to(roomId).emit("user-leaved", name);
      }

      socket.leave(roomId);

      if (usersInRooms[roomId] && usersInRooms[roomId].length === 0) {
        console.log(`Room ${roomId} is now empty`);
        delete usersInRooms[roomId];
        delete roomAdmin[roomId];
        delete roomPending[roomId];
      }
    }catch(err){
      console.log("Error handling leave-room:",err);
      socket.emit("error" , "Failed to Leave the Room. Please Try Again")
    }
   })


   socket.on("delete-file", async ({ roomId, fileName }) => {
    try {
      const room = await Room.findOne({ roomId });
      if (!room) return;

      // Remove file
      room.files = room.files.filter(f => f.name !== fileName);
      await room.save();

      // Notify all clients in the room
      const filesWithCode = await getRoomFiles(roomId);
      io.to(roomId).emit("files-data", filesWithCode);

      io.to(roomId).emit("file-deleted", {
        name : socket.data.name,
        fileName,
      })

    } catch (err) {
      console.error("Error deleting file:", err.message);
    }
  });


  socket.on("disconnect", () => {
      const { roomId } = socket.data || {};
        delete activeUsers[socket.id];
        if (roomId) {
          io.to(roomId).emit("active-users", getActiveUsers(roomId));
        }
        for (const roomId in usersInRooms) {
          usersInRooms[roomId] = usersInRooms[roomId].filter(user => user.id !== socket.id);
          // Emit updated user list
          io.to(roomId).emit('active-users', usersInRooms[roomId]);
        }
  });

});

app.get('/api/room-exists/:roomId' , async (req , res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    res.json({ exists: !!room });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
})

app.post('/run-live', async (req, res) => {
  const { code, input } = req.body;

  try {
    const output = await runPythonCodeWithInput(code, input.split('\n'));
    res.json({ output });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to run code' });
  }
});

const PORT = 4000;
connectDB();
// server.listen(PORT, () => {
//   console.log(`🚀 Server running at http://127.0.0.1:${PORT}`);
// });

server.listen(process.env.IndexPORT || '0.0.0.0', () => {
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
});













// const express = require('express');
// const http = require('http');
// const cors = require('cors');
// const { Server } = require('socket.io');
// const dotenv = require('dotenv');
// const connectDB = require('./db');
// const Room = require('./models/Room');
// const axios = require('axios');
// const runPythonCodeWithInput = require('./runCodeWithDocker');

// // Load environment variables
// dotenv.config();

// // Initialize Express app
// const app = express();
// const server = http.createServer(app);

// // Configure CORS
// const allowedOrigins = [
//   "http://localhost:3000",
//   "http://127.0.0.1:3000",
//   process.env.CLIENT_URL
// ].filter(Boolean);

// app.use(cors({
//   origin: allowedOrigins,
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"]
// }));

// app.use(express.json());

// // Configure Socket.IO
// const io = new Server(server, {
//   cors: {
//     origin: allowedOrigins,
//     methods: ["GET", "POST"],
//     credentials: true
//   },
//   pingTimeout: 60000,
//   pingInterval: 25000,
//   connectionStateRecovery: {
//     maxDisconnectionDuration: 2 * 60 * 1000,
//     skipMiddlewares: true
//   }
// });

// // State management
// const roomState = {
//   users: {},
//   admins: {},
//   pendingRequests: {}
// };

// // Utility functions
// const getRoomFiles = async (roomId) => {
//   try {
//     const room = await Room.findOne({ roomId });
//     if (!room || !room.files) return [];
    
//     return room.files.map(file => ({
//       name: file.name || file.fileName,
//       code: file.code,
//       language: file.language || "javascript"
//     }));
//   } catch (err) {
//     console.error("Error getting room files:", err);
//     return [];
//   }
// };

// const getActiveUsers = (roomId) => {
//   return Object.values(roomState.users).filter(user => user.roomId === roomId);
// };

// const cleanupRoom = async (roomId) => {
//   try {
//     const usersInRoom = getActiveUsers(roomId);
//     if (usersInRoom.length === 0) {
//       delete roomState.admins[roomId];
//       delete roomState.pendingRequests[roomId];
//       console.log(`Cleaned up room ${roomId}`);
//     }
//   } catch (err) {
//     console.error("Error cleaning up room:", err);
//   }
// };

// // Socket.IO event handlers
// const setupSocketHandlers = (socket) => {
//   console.log("✅ User connected:", socket.id);

//   // Final join after approval
//   socket.on('final-join', async ({ roomId, name }) => {
//     try {
//       const room = await Room.findOne({ roomId });
//       if (!room) {
//         socket.emit('error', 'Room not found');
//         return;
//       }

//       socket.join(roomId);
//       socket.data = { name, roomId };
//       roomState.users[socket.id] = { id: socket.id, name, roomId };

//       const filesWithCode = await getRoomFiles(roomId);
//       socket.emit("files-data", filesWithCode);
//       io.to(roomId).emit("active-users", getActiveUsers(roomId));
//       io.to(roomId).emit("NewJoin", { name });
//     } catch (err) {
//       console.error("Final join error:", err);
//       socket.emit('error', 'Failed to join room');
//     }
//   });

//   // Initial join request
//   socket.on('join-room', async ({ roomId, name, isCreator }) => {
//     try {
//       let room = await Room.findOne({ roomId });
      
//       if (!room) {
//         if (!isCreator) {
//           socket.emit('error', 'Room not found');
//           return;
//         }
        
//         room = await Room.create({ 
//           roomId,
//           files: [{ 
//             name: "file1.js", 
//             code: "// Start coding...",
//             language: "javascript"
//           }]
//         });
//         console.log('Created new room:', roomId);
//       }

//       socket.data = { name, roomId };

//       if (isCreator) {
//         roomState.admins[roomId] = socket.id;
//         socket.emit("room-joined", { status: "admin" });
//         socket.join(roomId);
        
//         roomState.users[socket.id] = { id: socket.id, name, roomId };
//         io.to(roomId).emit("active-users", getActiveUsers(roomId));
        
//         const filesWithCode = await getRoomFiles(roomId);
//         socket.emit("files-data", filesWithCode);
//       } else {
//         const adminSocketId = roomState.admins[roomId];
//         if (adminSocketId) {
//           roomState.pendingRequests[roomId] = roomState.pendingRequests[roomId] || [];
//           roomState.pendingRequests[roomId].push({ socketId: socket.id, name });
          
//           io.to(adminSocketId).emit("join-request", {
//             requesterId: socket.id,
//             name
//           });
//         } else {
//           socket.emit("room-join-failed", { reason: "Room not available" });
//         }
//       }
//     } catch (err) {
//       console.error("Join room error:", err);
//       socket.emit("error", "Failed to join room");
//     }
//   });

//   // Admin response to join request
//   socket.on("respond-join", async ({ requesterId, accepted }) => {
//     try {
//       const roomId = socket.data?.roomId;
//       if (!roomId) return;

//       if (accepted) {
//         const requesterSocket = io.sockets.sockets.get(requesterId);
//         if (requesterSocket) {
//           requesterSocket.emit("room-joined", { status: "accepted" });
          
//           // Remove from pending requests
//           if (roomState.pendingRequests[roomId]) {
//             roomState.pendingRequests[roomId] = 
//               roomState.pendingRequests[roomId].filter(req => req.socketId !== requesterId);
//           }
//         }
//       } else {
//         io.to(requesterId).emit("room-joined", { status: "rejected" });
//       }
//     } catch (err) {
//       console.error("Respond join error:", err);
//     }
//   });

//   // File operations
//   socket.on('create-file', async ({ roomId, fileName, language = "javascript" }) => {
//     try {
//       const room = await Room.findOne({ roomId });
//       if (!room) throw new Error("Room not found");

//       if (room.files.some(f => f.name === fileName)) {
//         throw new Error("File already exists");
//       }

//       room.files.push({
//         name: fileName,
//         code: `// Start coding in ${fileName}...`,
//         language
//       });
//       await room.save();

//       io.to(roomId).emit("file-created-toast", {
//         name: socket.data?.name || 'Someone',
//         fileName,
//       });

//       const filesWithCode = await getRoomFiles(roomId);
//       io.to(roomId).emit("files-data", filesWithCode);
//     } catch (err) {
//       console.error("Create file error:", err);
//       socket.emit("error", err.message);
//     }
//   });

//   socket.on('code-change', async ({ roomId, fileName, code }) => {
//     try {
//       const room = await Room.findOne({ roomId });
//       if (room) {
//         const file = room.files.find(f => f.name === fileName);
//         if (file) {
//           file.code = code;
//           await room.save();
//         }
//       }
//       socket.to(roomId).emit("code-update", { fileName, code });
//     } catch (err) {
//       console.error("Code change error:", err);
//     }
//   });

//   socket.on("delete-file", async ({ roomId, fileName }) => {
//     try {
//       const room = await Room.findOne({ roomId });
//       if (!room) return;

//       room.files = room.files.filter(f => f.name !== fileName);
//       await room.save();

//       const filesWithCode = await getRoomFiles(roomId);
//       io.to(roomId).emit("files-data", filesWithCode);
//     } catch (err) {
//       console.error("Delete file error:", err);
//     }
//   });

//   // Chat messages
//   socket.on('chat-message', ({ roomId, message, name }) => {
//     io.to(roomId).emit('chat-message', {
//       message,
//       name,
//       timestamp: new Date().toISOString()
//     });
//   });

//   // Disconnection handler
//   socket.on("disconnect", () => {
//     try {
//       const { roomId } = socket.data || {};
//       delete roomState.users[socket.id];

//       if (roomId) {
//         io.to(roomId).emit("active-users", getActiveUsers(roomId));
//         cleanupRoom(roomId);
//       }
//     } catch (err) {
//       console.error("Disconnect error:", err);
//     }
//   });
// };

// // Apply socket handlers
// io.on('connection', setupSocketHandlers);

// // API Routes
// app.post('/run', async (req, res) => {
//   try {
//     const { code, language, input } = req.body;
    
//     const langMap = {
//       javascript: 93,
//       python: 71,
//       cpp: 54,
//       java: 62,
//     };

//     const response = await axios.post(
//       'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', 
//       {
//         source_code: code,
//         language_id: langMap[language] || 93,
//         stdin: input || '',
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
//           'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
//         }
//       }
//     );

//     const { stdout, stderr, compile_output } = response.data;
//     const output = compile_output || stderr || stdout || 'No output returned.';
//     res.json({ output });
//   } catch (err) {
//     console.error("Run code error:", err);
//     res.status(500).json({ error: "Failed to run code" });
//   }
// });

// app.post('/run-live', async (req, res) => {
//   try {
//     const { code, input } = req.body;
//     const output = await runPythonCodeWithInput(code, input?.split('\n') || []);
//     res.json({ output });
//   } catch (err) {
//     console.error("Run live error:", err);
//     res.status(500).json({ error: 'Failed to run code' });
//   }
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error('Server error:', err);
//   res.status(500).json({ error: 'Internal server error' });
// });

// // Connect to database and start server
// connectDB()
//   .then(() => {
//     const PORT = process.env.PORT || 4000;
//     server.listen(PORT, () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//     });
//   })
//   .catch(err => {
//     console.error('Failed to connect to database:', err);
//     process.exit(1);
//   });
