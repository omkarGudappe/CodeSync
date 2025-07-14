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

const port = 1234; // use only this for Render!
server.listen(port , () => {
  console.log(`Server running on port ${port}`);
});
