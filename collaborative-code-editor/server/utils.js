const Y = require('yjs');
const encoding = require('lib0/encoding');
const decoding = require('lib0/decoding');
const map = new Map();

// Message types used by y-protocols
const messageSync = 0;
const messageAwareness = 1;
const messageAuth = 2;

// Ping interval
const pingIntervalMs = 30000;

// Awareness handling (like cursors and presence)
const awarenessStates = new Map();

function writeSyncStep1(doc) {
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageSync);
  Y.encodeStateVector(doc, encoder);
  return encoding.toUint8Array(encoder);
}

function writeSyncUpdate(doc, update) {
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageSync);
  Y.writeUpdate(update, encoder);
  return encoding.toUint8Array(encoder);
}

function setupWSConnection(conn, req) {
  const docName = req.url.slice(1).split('?')[0];
  if (!docName) {
    conn.close();
    return;
  }

  let doc = map.get(docName);
  if (!doc) {
    doc = new Y.Doc();
    map.set(docName, doc);
  }

  // Set up ping to keep connection alive
  const pingInterval = setInterval(() => {
    if (conn.readyState === 1) {
      conn.ping();
    }
  }, pingIntervalMs);

  // When connection is closed
  conn.on('close', () => {
    clearInterval(pingInterval);
    awarenessStates.delete(conn);
  });

  // Initial sync
  const stateVector = Y.encodeStateVector(doc);
  const update = Y.encodeStateAsUpdate(doc, stateVector);
  conn.send(writeSyncUpdate(doc, update));

  // Handle messages
  conn.on('message', (message) => {
    const decoder = decoding.createDecoder(new Uint8Array(message));
    const messageType = decoding.readVarUint(decoder);

    if (messageType === messageSync) {
      const update = Y.decodeUpdate(decoder);
      Y.applyUpdate(doc, update);
      // Broadcast update to all other connections
      for (const client of awarenessStates.keys()) {
        if (client !== conn && client.readyState === 1) {
          client.send(writeSyncUpdate(doc, update));
        }
      }
    }
  });

  // Store connection in awareness list
  awarenessStates.set(conn, {});
}

module.exports = { setupWSConnection };
