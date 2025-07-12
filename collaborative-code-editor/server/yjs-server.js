import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils.js';
import dotenv from 'dotenv';
dotenv.config();
const server = http.createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', (conn, req) => {
  setupWSConnection(conn, req);
});

const PORT = process.env.YjsPORT || 1234;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Yjs WebSocket server running on ws://0.0.0.0:${PORT}`);
});
