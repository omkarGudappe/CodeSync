// // const Y = require('yjs');
// // const encoding = require('lib0/encoding');
// // const decoding = require('lib0/decoding');
// // const map = new Map();

// // // Message types used by y-protocols
// // const messageSync = 0;
// // const messageAwareness = 1;
// // const messageAuth = 2;

// // // Ping interval
// // const pingIntervalMs = 30000;

// // // Awareness handling (like cursors and presence)
// // const awarenessStates = new Map();

// // function writeSyncStep1(doc) {
// //   const encoder = encoding.createEncoder();
// //   encoding.writeVarUint(encoder, messageSync);
// //   Y.encodeStateVector(doc, encoder);
// //   return encoding.toUint8Array(encoder);
// // }

// // function writeSyncUpdate(doc, update) {
// //   const encoder = encoding.createEncoder();
// //   encoding.writeVarUint(encoder, messageSync);
// //   Y.writeUpdate(update, encoder);
// //   return encoding.toUint8Array(encoder);
// // }

// // const Y = require('yjs');
// // const encoding = require('lib0/encoding');
// // const decoding = require('lib0/decoding');
// // const map = new Map();

// // // Message types used by y-protocols
// // const messageSync = 0;
// // const messageAwareness = 1;
// // const messageAuth = 2;

// // // Ping interval
// // const pingIntervalMs = 30000;

// // // Awareness handling (like cursors and presence)
// // const awarenessStates = new Map();

// // function writeSyncStep1(doc) {
// //   const encoder = encoding.createEncoder();
// //   encoding.writeVarUint(encoder, messageSync);
// //   Y.encodeStateVector(doc, encoder);
// //   return encoding.toUint8Array(encoder);
// // }

// // function writeSyncUpdate(doc, update) {
// //   const encoder = encoding.createEncoder();
// //   encoding.writeVarUint(encoder, messageSync);
// //   encoding.writeUint8Array(encoder, update);
// //   return encoding.toUint8Array(encoder);
// // }

// // // ... rest unchanged ...

// // function setupWSConnection(conn, req) {
// //   const docName = req.url.slice(1).split('?')[0];
// //   if (!docName) {
// //     conn.close();
// //     return;
// //   }

// //   let doc = map.get(docName);
// //   if (!doc) {
// //     doc = new Y.Doc();
// //     map.set(docName, doc);
// //   }

// //   // Set up ping to keep connection alive
// //   const pingInterval = setInterval(() => {
// //     if (conn.readyState === 1) {
// //       conn.ping();
// //     }
// //   }, pingIntervalMs);

// //   // When connection is closed
// //   conn.on('close', () => {
// //     clearInterval(pingInterval);
// //     awarenessStates.delete(conn);
// //   });

// //   // Initial sync
// //   const stateVector = Y.encodeStateVector(doc);
// //   const update = Y.encodeStateAsUpdate(doc, stateVector);
// //   conn.send(writeSyncUpdate(doc, update));

// //   // Handle messages
// //   conn.on('message', (message) => {
// //     const decoder = decoding.createDecoder(new Uint8Array(message));
// //     const messageType = decoding.readVarUint(decoder);

// //     if (messageType === messageSync) {
// //       const update = Y.decodeUpdate(decoder);
// //       Y.applyUpdate(doc, update);
// //       // Broadcast update to all other connections
// //       for (const client of awarenessStates.keys()) {
// //         if (client !== conn && client.readyState === 1) {
// //           client.send(writeSyncUpdate(doc, update));
// //         }
// //       }
// //     }
// //   });

// //   // Store connection in awareness list
// //   awarenessStates.set(conn, {});
// // }

// // module.exports = { setupWSConnection };





// const Y = require('yjs');
// const encoding = require('lib0/encoding');
// const decoding = require('lib0/decoding');
// const map = new Map();

// // Message types
// const messageSync = 0;
// const messageAwareness = 1;
// const messageAuth = 2;

// // Ping interval
// const pingIntervalMs = 30000;
// const awarenessStates = new Map();

// function writeSyncStep1(doc) {
//   const encoder = encoding.createEncoder();
//   encoding.writeVarUint(encoder, messageSync);
//   Y.encodeStateVector(doc, encoder);
//   return encoding.toUint8Array(encoder);
// }

// function writeSyncUpdate(doc, update) {
//   const encoder = encoding.createEncoder();
//   encoding.writeVarUint(encoder, messageSync);
//   encoding.writeUint8Array(encoder, update);
//   return encoding.toUint8Array(encoder);
// }

// function setupWSConnection(conn, req) {
//   const docName = req.url.slice(1).split('?')[0];
//   if (!docName) {
//     conn.close();
//     return;
//   }

//   let doc = map.get(docName);
//   if (!doc) {
//     doc = new Y.Doc();
//     map.set(docName, doc);
//   }

//   // Ping to keep connection alive
//   const pingInterval = setInterval(() => {
//     if (conn.readyState === 1) conn.ping();
//   }, pingIntervalMs);

//   conn.on('close', () => {
//     clearInterval(pingInterval);
//     awarenessStates.delete(conn);
//   });

//   // Initial sync
//   try {
//     const stateVector = Y.encodeStateVector(doc);
//     const update = Y.encodeStateAsUpdate(doc, stateVector);
//     conn.send(writeSyncUpdate(doc, update));
//   } catch (err) {
//     console.error('Initial sync error:', err);
//   }

//   // Message handler with error protection
//   conn.on('message', (message) => {
//     try {
//       const data = message instanceof Buffer ? message : Buffer.from(message);
//       const decoder = decoding.createDecoder(new Uint8Array(data));
//       const messageType = decoding.readVarUint(decoder);

//       if (messageType === messageSync) {
//         const update = Y.decodeUpdate(decoder);
//         Y.applyUpdate(doc, update, conn);
        
//         // Broadcast to other clients
//         awarenessStates.forEach((_, client) => {
//           if (client !== conn && client.readyState === 1) {
//             try {
//               client.send(writeSyncUpdate(doc, update));
//             } catch (err) {
//               console.error('Broadcast error:', err);
//             }
//           }
//         });
//       }
//     } catch (err) {
//       console.error('Message handling error:', err);
//       conn.close();
//     }
//   });

//   awarenessStates.set(conn, {});
// }

// module.exports = { setupWSConnection };


const Y = require('yjs');
const encoding = require('lib0/encoding');
const decoding = require('lib0/decoding');
const map = new Map();

// Message types
const messageSync = 0;
const messageAwareness = 1;
const messageAuth = 2;
const messageError = 3;

// Constants
const PING_INTERVAL_MS = 30000;
const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_UPDATE_SIZE = 1 * 1024 * 1024; // 1MB

// Awareness handling
const awarenessStates = new Map();
const docStats = new Map();

function validateDocName(docName) {
  if (!docName || typeof docName !== 'string') return false;
  if (docName.length > 256) return false;
  return /^[a-zA-Z0-9_\-\.]+$/.test(docName);
}

function writeSyncStep1(doc) {
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageSync);
  Y.encodeStateVector(doc, encoder);
  return encoding.toUint8Array(encoder);
}

function writeSyncUpdate(doc, update) {
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageSync);
  encoding.writeUint8Array(encoder, update);
  return encoding.toUint8Array(encoder);
}

function writeError(message) {
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageError);
  encoding.writeVarString(encoder, message);
  return encoding.toUint8Array(encoder);
}

function setupWSConnection(conn, req) {
  const docName = req.url.slice(1).split('?')[0];
  
  // Validate document name
  if (!validateDocName(docName)) {
    conn.send(writeError('Invalid document name'));
    conn.close(1008, 'Invalid document name');
    return;
  }

  // Get or create document
  let doc = map.get(docName);
  if (!doc) {
    doc = new Y.Doc();
    map.set(docName, doc);
    docStats.set(docName, {
      createdAt: new Date(),
      updates: 0,
      size: 0,
      connections: 0
    });
  }

  // Update stats
  const stats = docStats.get(docName);
  stats.connections++;

  // Setup ping-pong to keep connection alive
  const pingInterval = setInterval(() => {
    if (conn.readyState === 1) conn.ping();
  }, PING_INTERVAL_MS);

  // Cleanup on close
  conn.on('close', () => {
    clearInterval(pingInterval);
    awarenessStates.delete(conn);
    stats.connections--;
    
    // Cleanup empty docs
    if (stats.connections === 0 && stats.updates === 0) {
      setTimeout(() => {
        if (stats.connections === 0) {
          map.delete(docName);
          docStats.delete(docName);
          console.log(`🧹 Cleaned up unused document: ${docName}`);
        }
      }, 60000);
    }
  });

  // Initial sync
  try {
    const stateVector = Y.encodeStateVector(doc);
    const update = Y.encodeStateAsUpdate(doc, stateVector);
    
    // Validate update size
    if (update.byteLength > MAX_UPDATE_SIZE) {
      throw new Error(`Initial sync too large: ${update.byteLength} bytes`);
    }
    
    conn.send(writeSyncUpdate(doc, update));
  } catch (err) {
    console.error(`Initial sync error for ${docName}:`, err);
    conn.send(writeError('Failed initial sync'));
    conn.close(1011, 'Initial sync failed');
    return;
  }

  // Message handler
  conn.on('message', (message) => {
    try {
      // Validate message
      if (!(message instanceof Buffer || message instanceof Uint8Array)) {
        throw new Error('Invalid message format');
      }
      
      const data = new Uint8Array(message);
      if (data.length === 0) {
        throw new Error('Empty message');
      }
      
      if (data.length > MAX_UPDATE_SIZE) {
        throw new Error(`Message too large: ${data.length} bytes`);
      }

      const decoder = decoding.createDecoder(data);
      const messageType = decoding.readVarUint(decoder);

      switch (messageType) {
        case messageSync:
          const update = Y.decodeUpdate(decoder);
          stats.updates++;
          stats.size += update.byteLength;
          
          // Validate doc size
          if (stats.size > MAX_DOC_SIZE) {
            throw new Error(`Document ${docName} exceeded size limit`);
          }
          
          Y.applyUpdate(doc, update, conn);
          
          // Broadcast to other clients
          awarenessStates.forEach((_, client) => {
            if (client !== conn && client.readyState === 1) {
              try {
                client.send(writeSyncUpdate(doc, update));
              } catch (err) {
                console.error('Broadcast error:', err);
                client.close(1011, 'Broadcast failed');
              }
            }
          });
          break;
          
        case messageAwareness:
          // Handle awareness updates
          break;
          
        default:
          throw new Error(`Unknown message type: ${messageType}`);
      }
    } catch (err) {
      console.error(`Message handling error for ${docName}:`, err);
      try {
        conn.send(writeError(err.message));
      } catch (sendErr) {
        console.error('Failed to send error message:', sendErr);
      }
      conn.close(1011, err.message);
    }
  });

  // Store connection in awareness list
  awarenessStates.set(conn, {});
}

module.exports = { 
  setupWSConnection,
  getDocStats: () => Array.from(docStats.entries())
};
