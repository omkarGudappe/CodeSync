// // const http = require('http');
// // const WebSocket = require('ws');
// // const { WebSocketServer } = WebSocket;
// // const { setupWSConnection } = require('./utils.js');
// // require('dotenv').config();

// // const server = http.createServer((req, res) => {
// //   if (req.url === '/health') {
// //     res.writeHead(200);
// //     res.end('OK');
// //   } else {
// //     res.writeHead(404);
// //     res.end();
// //   }
// // });

// // const wss = new WebSocketServer({ server });

// // wss.on('connection', (conn, req) => {
// //   setupWSConnection(conn, req);
// // });

// // // const port = process.env.PORT || 1234;
// // // server.listen(port, () => {
// // //   console.log(`Server running on port ${port}`);
// // // });

// // const PORT = process.env.PORT;
// // server.listen(PORT, '0.0.0.0', () => {
// //   console.log(`✅ Yjs WebSocket server running on wss://0.0.0.0:${PORT}`);
// // });

// const http = require('http');
// const WebSocket = require('ws');
// const { WebSocketServer } = WebSocket;
// const { setupWSConnection } = require('./utils.js');
// require('dotenv').config();

// const server = http.createServer((req, res) => {
//   if (req.url === '/health') {
//     res.writeHead(200);
//     res.end('OK');
//   } else {
//     res.writeHead(404);
//     res.end();
//   }
// });

// const wss = new WebSocketServer({ 
//   server,
//   perMessageDeflate: {
//     zlibDeflateOptions: {
//       chunkSize: 1024,
//       memLevel: 7,
//       level: 3
//     },
//     zlibInflateOptions: {
//       chunkSize: 10 * 1024
//     },
//     clientNoContextTakeover: true,
//     serverNoContextTakeover: true,
//     threshold: 1024,
//     concurrencyLimit: 10
//   }
// });

// wss.on('connection', (conn, req) => {
//   console.log('New connection from:', req.headers['origin']);
//   console.log('Request URL:', req.url);
  
//   conn.on('error', (err) => {
//     console.error('WebSocket error:', err);
//   });
  
//   conn.on('close', () => {
//     console.log('Connection closed');
//   });
  
//   try {
//     setupWSConnection(conn, req);
//   } catch (err) {
//     console.error('Connection setup error:', err);
//     conn.close();
//   }
// });

// const PORT = process.env.PORT || 1234;
// server.listen(PORT, '0.0.0.0', () => {
//   console.log(`✅ Yjs WebSocket server running on wss://0.0.0.0:${PORT}`);
// });

// // Handle server errors
// server.on('error', (err) => {
//   console.error('Server error:', err);
// });

// process.on('uncaughtException', (err) => {
//   console.error('Uncaught exception:', err);
// });



const http = require('http');
const WebSocket = require('ws');
const { WebSocketServer } = WebSocket;
const { setupWSConnection } = require('./utils.js');
require('dotenv').config();

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  } else {
    res.writeHead(404);
    res.end();
  }
});

const wss = new WebSocketServer({ 
  server,
  perMessageDeflate: {
    zlibDeflateOptions: {
      chunkSize: 1024,
      memLevel: 7,
      level: 3
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    clientNoContextTakeover: true,
    serverNoContextTakeover: true,
    threshold: 1024,
    concurrencyLimit: 10
  },
  maxPayload: 10 * 1024 * 1024 // 10MB max payload
});

// Connection statistics
const stats = {
  connections: 0,
  errors: 0,
  messages: 0
};

wss.on('connection', (conn, req) => {
  stats.connections++;
  console.log(`[CONNECT] Total: ${stats.connections} - From: ${req.headers['origin'] || 'unknown'} - URL: ${req.url}`);

  // Heartbeat tracking
  let isAlive = true;
  const pingInterval = setInterval(() => {
    if (!isAlive) {
      console.log(`[TIMEOUT] Closing stale connection: ${req.url}`);
      conn.terminate();
      return;
    }
    isAlive = false;
    conn.ping();
  }, 30000);

  // Setup connection
  try {
    setupWSConnection(conn, req);
  } catch (err) {
    stats.errors++;
    console.error(`[SETUP ERROR] ${err.message}`);
    conn.close(1011, 'Server error during setup');
  }

  // Event handlers
  conn.on('pong', () => {
    isAlive = true;
  });

  conn.on('message', (data) => {
    stats.messages++;
    // Message content is handled in setupWSConnection
  });

  conn.on('error', (err) => {
    stats.errors++;
    console.error(`[CONN ERROR] ${err.message}`);
  });

  conn.on('close', (code, reason) => {
    stats.connections--;
    clearInterval(pingInterval);
    console.log(`[DISCONNECT] Code: ${code} - Reason: ${reason.toString()} - Remaining: ${stats.connections}`);
  });
});

// Error handlers
server.on('error', (err) => {
  console.error(`[SERVER ERROR] ${err.message}`);
});

process.on('uncaughtException', (err) => {
  console.error(`[CRASH] Uncaught Exception: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRASH] Unhandled Rejection at:', promise, 'reason:', reason);
});

const PORT = process.env.PORT || 1234;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Yjs WebSocket server running on ws://0.0.0.0:${PORT}`);
  console.log('⚙️  Configuration:');
  console.log(`- Max payload: ${wss.options.maxPayload / (1024 * 1024)}MB`);
  console.log(`- Compression: ${wss.options.perMessageDeflate ? 'enabled' : 'disabled'}`);
});

// Periodic stats logging
setInterval(() => {
  console.log(`📊 Stats - Connections: ${stats.connections} | Messages: ${stats.messages} | Errors: ${stats.errors}`);
  stats.messages = 0;
  stats.errors = 0;
}, 60000);
