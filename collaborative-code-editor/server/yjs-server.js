const http = require('http');
const WebSocket = require('ws');
const { WebSocketServer } = WebSocket;
const { setupWSConnection } = require('./utils.js');
require('dotenv').config();

const server = http.createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', (conn, req) => {
  setupWSConnection(conn, req);
});

const port = process.env.PORT; // use only this for Render!
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
