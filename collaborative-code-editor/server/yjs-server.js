import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils.js';
require('dotenv').config();

const server = http.createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', (conn, req) => {
  setupWSConnection(conn, req);
});

const PORT = process.env.YjsPORT || 1234;

server.listen(PORT, () => {
  console.log(`✅ Yjs WebSocket server running on ws://localhost:${PORT}`);
});
