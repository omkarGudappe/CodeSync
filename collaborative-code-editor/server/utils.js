// // // const Y = require('yjs');
// // // const encoding = require('lib0/encoding');
// // // const decoding = require('lib0/decoding');
// // // const map = new Map();

// // // // Message types used by y-protocols
// // // const messageSync = 0;
// // // const messageAwareness = 1;
// // // const messageAuth = 2;

// // // // Ping interval
// // // const pingIntervalMs = 30000;

// // // // Awareness handling (like cursors and presence)
// // // const awarenessStates = new Map();

// // // function writeSyncStep1(doc) {
// // //   const encoder = encoding.createEncoder();
// // //   encoding.writeVarUint(encoder, messageSync);
// // //   Y.encodeStateVector(doc, encoder);
// // //   return encoding.toUint8Array(encoder);
// // // }

// // // function writeSyncUpdate(doc, update) {
// // //   const encoder = encoding.createEncoder();
// // //   encoding.writeVarUint(encoder, messageSync);
// // //   Y.writeUpdate(update, encoder);
// // //   return encoding.toUint8Array(encoder);
// // // }

// // // const Y = require('yjs');
// // // const encoding = require('lib0/encoding');
// // // const decoding = require('lib0/decoding');
// // // const map = new Map();

// // // // Message types used by y-protocols
// // // const messageSync = 0;
// // // const messageAwareness = 1;
// // // const messageAuth = 2;

// // // // Ping interval
// // // const pingIntervalMs = 30000;

// // // // Awareness handling (like cursors and presence)
// // // const awarenessStates = new Map();

// // // function writeSyncStep1(doc) {
// // //   const encoder = encoding.createEncoder();
// // //   encoding.writeVarUint(encoder, messageSync);
// // //   Y.encodeStateVector(doc, encoder);
// // //   return encoding.toUint8Array(encoder);
// // // }

// // // function writeSyncUpdate(doc, update) {
// // //   const encoder = encoding.createEncoder();
// // //   encoding.writeVarUint(encoder, messageSync);
// // //   encoding.writeUint8Array(encoder, update);
// // //   return encoding.toUint8Array(encoder);
// // // }

// // // // ... rest unchanged ...

// // // function setupWSConnection(conn, req) {
// // //   const docName = req.url.slice(1).split('?')[0];
// // //   if (!docName) {
// // //     conn.close();
// // //     return;
// // //   }

// // //   let doc = map.get(docName);
// // //   if (!doc) {
// // //     doc = new Y.Doc();
// // //     map.set(docName, doc);
// // //   }

// // //   // Set up ping to keep connection alive
// // //   const pingInterval = setInterval(() => {
// // //     if (conn.readyState === 1) {
// // //       conn.ping();
// // //     }
// // //   }, pingIntervalMs);

// // //   // When connection is closed
// // //   conn.on('close', () => {
// // //     clearInterval(pingInterval);
// // //     awarenessStates.delete(conn);
// // //   });

// // //   // Initial sync
// // //   const stateVector = Y.encodeStateVector(doc);
// // //   const update = Y.encodeStateAsUpdate(doc, stateVector);
// // //   conn.send(writeSyncUpdate(doc, update));

// // //   // Handle messages
// // //   conn.on('message', (message) => {
// // //     const decoder = decoding.createDecoder(new Uint8Array(message));
// // //     const messageType = decoding.readVarUint(decoder);

// // //     if (messageType === messageSync) {
// // //       const update = Y.decodeUpdate(decoder);
// // //       Y.applyUpdate(doc, update);
// // //       // Broadcast update to all other connections
// // //       for (const client of awarenessStates.keys()) {
// // //         if (client !== conn && client.readyState === 1) {
// // //           client.send(writeSyncUpdate(doc, update));
// // //         }
// // //       }
// // //     }
// // //   });

// // //   // Store connection in awareness list
// // //   awarenessStates.set(conn, {});
// // // }

// // // module.exports = { setupWSConnection };





// // const Y = require('yjs');
// // const encoding = require('lib0/encoding');
// // const decoding = require('lib0/decoding');
// // const map = new Map();

// // // Message types
// // const messageSync = 0;
// // const messageAwareness = 1;
// // const messageAuth = 2;

// // // Ping interval
// // const pingIntervalMs = 30000;
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

// //   // Ping to keep connection alive
// //   const pingInterval = setInterval(() => {
// //     if (conn.readyState === 1) conn.ping();
// //   }, pingIntervalMs);

// //   conn.on('close', () => {
// //     clearInterval(pingInterval);
// //     awarenessStates.delete(conn);
// //   });

// //   // Initial sync
// //   try {
// //     const stateVector = Y.encodeStateVector(doc);
// //     const update = Y.encodeStateAsUpdate(doc, stateVector);
// //     conn.send(writeSyncUpdate(doc, update));
// //   } catch (err) {
// //     console.error('Initial sync error:', err);
// //   }

// //   // Message handler with error protection
// //   conn.on('message', (message) => {
// //     try {
// //       const data = message instanceof Buffer ? message : Buffer.from(message);
// //       const decoder = decoding.createDecoder(new Uint8Array(data));
// //       const messageType = decoding.readVarUint(decoder);

// //       if (messageType === messageSync) {
// //         const update = Y.decodeUpdate(decoder);
// //         Y.applyUpdate(doc, update, conn);
        
// //         // Broadcast to other clients
// //         awarenessStates.forEach((_, client) => {
// //           if (client !== conn && client.readyState === 1) {
// //             try {
// //               client.send(writeSyncUpdate(doc, update));
// //             } catch (err) {
// //               console.error('Broadcast error:', err);
// //             }
// //           }
// //         });
// //       }
// //     } catch (err) {
// //       console.error('Message handling error:', err);
// //       conn.close();
// //     }
// //   });

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
// const messageError = 3;

// // Constants
// const PING_INTERVAL_MS = 30000;
// const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10MB
// const MAX_UPDATE_SIZE = 1 * 1024 * 1024; // 1MB

// // Awareness handling
// const awarenessStates = new Map();
// const docStats = new Map();

// function validateDocName(docName) {
//   if (!docName || typeof docName !== 'string') return false;
//   if (docName.length > 256) return false;
//   return /^[a-zA-Z0-9_\-\.]+$/.test(docName);
// }

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

// function writeError(message) {
//   const encoder = encoding.createEncoder();
//   encoding.writeVarUint(encoder, messageError);
//   encoding.writeVarString(encoder, message);
//   return encoding.toUint8Array(encoder);
// }

// function setupWSConnection(conn, req) {
//   const docName = req.url.slice(1).split('?')[0];
  
//   // Validate document name
//   if (!validateDocName(docName)) {
//     conn.send(writeError('Invalid document name'));
//     conn.close(1008, 'Invalid document name');
//     return;
//   }

//   // Get or create document
//   let doc = map.get(docName);
//   if (!doc) {
//     doc = new Y.Doc();
//     map.set(docName, doc);
//     docStats.set(docName, {
//       createdAt: new Date(),
//       updates: 0,
//       size: 0,
//       connections: 0
//     });
//   }

//   // Update stats
//   const stats = docStats.get(docName);
//   stats.connections++;

//   // Setup ping-pong to keep connection alive
//   const pingInterval = setInterval(() => {
//     if (conn.readyState === 1) conn.ping();
//   }, PING_INTERVAL_MS);

//   // Cleanup on close
//   conn.on('close', () => {
//     clearInterval(pingInterval);
//     awarenessStates.delete(conn);
//     stats.connections--;
    
//     // Cleanup empty docs
//     if (stats.connections === 0 && stats.updates === 0) {
//       setTimeout(() => {
//         if (stats.connections === 0) {
//           map.delete(docName);
//           docStats.delete(docName);
//           console.log(`🧹 Cleaned up unused document: ${docName}`);
//         }
//       }, 60000);
//     }
//   });

//   // Initial sync
//   try {
//     const stateVector = Y.encodeStateVector(doc);
//     const update = Y.encodeStateAsUpdate(doc, stateVector);
    
//     // Validate update size
//     if (update.byteLength > MAX_UPDATE_SIZE) {
//       throw new Error(`Initial sync too large: ${update.byteLength} bytes`);
//     }
    
//     conn.send(writeSyncUpdate(doc, update));
//   } catch (err) {
//     console.error(`Initial sync error for ${docName}:`, err);
//     conn.send(writeError('Failed initial sync'));
//     conn.close(1011, 'Initial sync failed');
//     return;
//   }

//   // Message handler
//   conn.on('message', (message) => {
//     try {
//       // Validate message
//       if (!(message instanceof Buffer || message instanceof Uint8Array)) {
//         throw new Error('Invalid message format');
//       }
      
//       const data = new Uint8Array(message);
//       if (data.length === 0) {
//         throw new Error('Empty message');
//       }
      
//       if (data.length > MAX_UPDATE_SIZE) {
//         throw new Error(`Message too large: ${data.length} bytes`);
//       }

//       const decoder = decoding.createDecoder(data);
//       const messageType = decoding.readVarUint(decoder);

//       switch (messageType) {
//         case messageSync:
//           const update = Y.decodeUpdate(decoder);
//           stats.updates++;
//           stats.size += update.byteLength;
          
//           // Validate doc size
//           if (stats.size > MAX_DOC_SIZE) {
//             throw new Error(`Document ${docName} exceeded size limit`);
//           }
          
//           Y.applyUpdate(doc, update, conn);
          
//           // Broadcast to other clients
//           awarenessStates.forEach((_, client) => {
//             if (client !== conn && client.readyState === 1) {
//               try {
//                 client.send(writeSyncUpdate(doc, update));
//               } catch (err) {
//                 console.error('Broadcast error:', err);
//                 client.close(1011, 'Broadcast failed');
//               }
//             }
//           });
//           break;
          
//         case messageAwareness:
//           // Handle awareness updates
//           break;
          
//         default:
//           throw new Error(`Unknown message type: ${messageType}`);
//       }
//     } catch (err) {
//       console.error(`Message handling error for ${docName}:`, err);
//       try {
//         conn.send(writeError(err.message));
//       } catch (sendErr) {
//         console.error('Failed to send error message:', sendErr);
//       }
//       conn.close(1011, err.message);
//     }
//   });

//   // Store connection in awareness list
//   awarenessStates.set(conn, {});
// }

// module.exports = { 
//   setupWSConnection,
//   getDocStats: () => Array.from(docStats.entries())
// };






const Y = require('yjs')
const syncProtocol = require('y-protocols/dist/sync.cjs')
const awarenessProtocol = require('y-protocols/dist/awareness.cjs')

const encoding = require('lib0/dist/encoding.cjs')
const decoding = require('lib0/dist/decoding.cjs')
const map = require('lib0/dist/map.cjs')

const debounce = require('lodash.debounce')

const callbackHandler = require('./callback.js').callbackHandler
const isCallbackSet = require('./callback.js').isCallbackSet

const CALLBACK_DEBOUNCE_WAIT = parseInt(process.env.CALLBACK_DEBOUNCE_WAIT) || 2000
const CALLBACK_DEBOUNCE_MAXWAIT = parseInt(process.env.CALLBACK_DEBOUNCE_MAXWAIT) || 10000

const wsReadyStateConnecting = 0
const wsReadyStateOpen = 1
const wsReadyStateClosing = 2 // eslint-disable-line
const wsReadyStateClosed = 3 // eslint-disable-line

// disable gc when using snapshots!
const gcEnabled = process.env.GC !== 'false' && process.env.GC !== '0'
const persistenceDir = process.env.YPERSISTENCE
/**
 * @type {{bindState: function(string,WSSharedDoc):void, writeState:function(string,WSSharedDoc):Promise<any>, provider: any}|null}
 */
let persistence = null
if (typeof persistenceDir === 'string') {
  console.info('Persisting documents to "' + persistenceDir + '"')
  // @ts-ignore
  const LeveldbPersistence = require('y-leveldb').LeveldbPersistence
  const ldb = new LeveldbPersistence(persistenceDir)
  persistence = {
    provider: ldb,
    bindState: async (docName, ydoc) => {
      const persistedYdoc = await ldb.getYDoc(docName)
      const newUpdates = Y.encodeStateAsUpdate(ydoc)
      ldb.storeUpdate(docName, newUpdates)
      Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc))
      ydoc.on('update', update => {
        ldb.storeUpdate(docName, update)
      })
    },
    writeState: async (docName, ydoc) => {}
  }
}

/**
 * @param {{bindState: function(string,WSSharedDoc):void,
 * writeState:function(string,WSSharedDoc):Promise<any>,provider:any}|null} persistence_
 */
exports.setPersistence = persistence_ => {
  persistence = persistence_
}

/**
 * @return {null|{bindState: function(string,WSSharedDoc):void,
  * writeState:function(string,WSSharedDoc):Promise<any>}|null} used persistence layer
  */
exports.getPersistence = () => persistence

/**
 * @type {Map<string,WSSharedDoc>}
 */
const docs = new Map()
// exporting docs so that others can use it
exports.docs = docs

const messageSync = 0
const messageAwareness = 1
// const messageAuth = 2

/**
 * @param {Uint8Array} update
 * @param {any} origin
 * @param {WSSharedDoc} doc
 */
const updateHandler = (update, origin, doc) => {
  const encoder = encoding.createEncoder()
  encoding.writeVarUint(encoder, messageSync)
  syncProtocol.writeUpdate(encoder, update)
  const message = encoding.toUint8Array(encoder)
  doc.conns.forEach((_, conn) => send(doc, conn, message))
}

class WSSharedDoc extends Y.Doc {
  /**
   * @param {string} name
   */
  constructor (name) {
    super({ gc: gcEnabled })
    this.name = name
    /**
     * Maps from conn to set of controlled user ids. Delete all user ids from awareness when this conn is closed
     * @type {Map<Object, Set<number>>}
     */
    this.conns = new Map()
    /**
     * @type {awarenessProtocol.Awareness}
     */
    this.awareness = new awarenessProtocol.Awareness(this)
    this.awareness.setLocalState(null)
    /**
     * @param {{ added: Array<number>, updated: Array<number>, removed: Array<number> }} changes
     * @param {Object | null} conn Origin is the connection that made the change
     */
    const awarenessChangeHandler = ({ added, updated, removed }, conn) => {
      const changedClients = added.concat(updated, removed)
      if (conn !== null) {
        const connControlledIDs = /** @type {Set<number>} */ (this.conns.get(conn))
        if (connControlledIDs !== undefined) {
          added.forEach(clientID => { connControlledIDs.add(clientID) })
          removed.forEach(clientID => { connControlledIDs.delete(clientID) })
        }
      }
      // broadcast awareness update
      const encoder = encoding.createEncoder()
      encoding.writeVarUint(encoder, messageAwareness)
      encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients))
      const buff = encoding.toUint8Array(encoder)
      this.conns.forEach((_, c) => {
        send(this, c, buff)
      })
    }
    this.awareness.on('update', awarenessChangeHandler)
    this.on('update', updateHandler)
    if (isCallbackSet) {
      this.on('update', debounce(
        callbackHandler,
        CALLBACK_DEBOUNCE_WAIT,
        { maxWait: CALLBACK_DEBOUNCE_MAXWAIT }
      ))
    }
  }
}

/**
 * Gets a Y.Doc by name, whether in memory or on disk
 *
 * @param {string} docname - the name of the Y.Doc to find or create
 * @param {boolean} gc - whether to allow gc on the doc (applies only when created)
 * @return {WSSharedDoc}
 */
const getYDoc = (docname, gc = true) => map.setIfUndefined(docs, docname, () => {
  const doc = new WSSharedDoc(docname)
  doc.gc = gc
  if (persistence !== null) {
    persistence.bindState(docname, doc)
  }
  docs.set(docname, doc)
  return doc
})

exports.getYDoc = getYDoc

/**
 * @param {any} conn
 * @param {WSSharedDoc} doc
 * @param {Uint8Array} message
 */
const messageListener = (conn, doc, message) => {
  try {
    const encoder = encoding.createEncoder()
    const decoder = decoding.createDecoder(message)
    const messageType = decoding.readVarUint(decoder)
    switch (messageType) {
      case messageSync:
        encoding.writeVarUint(encoder, messageSync)
        syncProtocol.readSyncMessage(decoder, encoder, doc, conn)

        // If the `encoder` only contains the type of reply message and no
        // message, there is no need to send the message. When `encoder` only
        // contains the type of reply, its length is 1.
        if (encoding.length(encoder) > 1) {
          send(doc, conn, encoding.toUint8Array(encoder))
        }
        break
      case messageAwareness: {
        awarenessProtocol.applyAwarenessUpdate(doc.awareness, decoding.readVarUint8Array(decoder), conn)
        break
      }
    }
  } catch (err) {
    console.error(err)
    doc.emit('error', [err])
  }
}

/**
 * @param {WSSharedDoc} doc
 * @param {any} conn
 */
const closeConn = (doc, conn) => {
  if (doc.conns.has(conn)) {
    /**
     * @type {Set<number>}
     */
    // @ts-ignore
    const controlledIds = doc.conns.get(conn)
    doc.conns.delete(conn)
    awarenessProtocol.removeAwarenessStates(doc.awareness, Array.from(controlledIds), null)
    if (doc.conns.size === 0 && persistence !== null) {
      // if persisted, we store state and destroy ydocument
      persistence.writeState(doc.name, doc).then(() => {
        doc.destroy()
      })
      docs.delete(doc.name)
    }
  }
  conn.close()
}

/**
 * @param {WSSharedDoc} doc
 * @param {any} conn
 * @param {Uint8Array} m
 */
const send = (doc, conn, m) => {
  if (conn.readyState !== wsReadyStateConnecting && conn.readyState !== wsReadyStateOpen) {
    closeConn(doc, conn)
  }
  try {
    conn.send(m, /** @param {any} err */ err => { err != null && closeConn(doc, conn) })
  } catch (e) {
    closeConn(doc, conn)
  }
}

const pingTimeout = 30000

/**
 * @param {any} conn
 * @param {any} req
 * @param {any} opts
 */
exports.setupWSConnection = (conn, req, { docName = req.url.slice(1).split('?')[0], gc = true } = {}) => {
  conn.binaryType = 'arraybuffer'
  // get doc, initialize if it does not exist yet
  const doc = getYDoc(docName, gc)
  doc.conns.set(conn, new Set())
  // listen and reply to events
  conn.on('message', /** @param {ArrayBuffer} message */ message => messageListener(conn, doc, new Uint8Array(message)))

  // Check if connection is still alive
  let pongReceived = true
  const pingInterval = setInterval(() => {
    if (!pongReceived) {
      if (doc.conns.has(conn)) {
        closeConn(doc, conn)
      }
      clearInterval(pingInterval)
    } else if (doc.conns.has(conn)) {
      pongReceived = false
      try {
        conn.ping()
      } catch (e) {
        closeConn(doc, conn)
        clearInterval(pingInterval)
      }
    }
  }, pingTimeout)
  conn.on('close', () => {
    closeConn(doc, conn)
    clearInterval(pingInterval)
  })
  conn.on('pong', () => {
    pongReceived = true
  })
  // put the following in a variables in a block so the interval handlers don't keep in in
  // scope
  {
    // send sync step 1
    const encoder = encoding.createEncoder()
    encoding.writeVarUint(encoder, messageSync)
    syncProtocol.writeSyncStep1(encoder, doc)
    send(doc, conn, encoding.toUint8Array(encoder))
    const awarenessStates = doc.awareness.getStates()
    if (awarenessStates.size > 0) {
      const encoder = encoding.createEncoder()
      encoding.writeVarUint(encoder, messageAwareness)
      encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(doc.awareness, Array.from(awarenessStates.keys())))
      send(doc, conn, encoding.toUint8Array(encoder))
    }
  }
}
