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

// const wss = new WebSocketServer({ server });

// wss.on('connection', (conn, req) => {
//   setupWSConnection(conn, req);
// });

// // const port = process.env.PORT || 1234;
// // server.listen(port, () => {
// //   console.log(`Server running on port ${port}`);
// // });

// const PORT = process.env.PORT;
// server.listen(PORT, '0.0.0.0', () => {
//   console.log(`✅ Yjs WebSocket server running on wss://0.0.0.0:${PORT}`);
// });

const http = require('http');
const WebSocket = require('ws');
const { WebSocketServer } = WebSocket;
const { setupWSConnection } = require('./utils.js');
require('dotenv').config();

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200);
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
  }
});

wss.on('connection', (conn, req) => {
  console.log('New connection from:', req.headers['origin']);
  console.log('Request URL:', req.url);
  
  conn.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
  
  conn.on('close', () => {
    console.log('Connection closed');
  });
  
  try {
    setupWSConnection(conn, req);
  } catch (err) {
    console.error('Connection setup error:', err);
    conn.close();
  }
});

const PORT = process.env.PORT || 1234;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Yjs WebSocket server running on wss://0.0.0.0:${PORT}`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});
