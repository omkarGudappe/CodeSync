const http = require('http');
const WebSocket = require('ws');
const { WebSocketServer } = WebSocket;
const { setupWSConnection } = require('./utils.js');
require('dotenv').config();

const port = process.env.PORT || 1234; // Use Render's injected PORT

const server = http.createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', (conn, req) => {
  setupWSConnection(conn, req);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`✅ Yjs WebSocket server running on ws://0.0.0.0:${port}`);
});
