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

const wss = new WebSocketServer({ server });

wss.on('connection', (conn, req) => {
  setupWSConnection(conn, req);
});

const port = process.env.PORT || 1234;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
