import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import '../Styles/TerminalE.css'

const TerminalE = ({ code, language, runTrigger , fitTrigger , onCodeOutput , OnTerminalError}) => {
  const terminalRef = useRef(null);
  const terminal = useRef(null);
  const fitAddon = useRef(null);
  const socket = useRef(null);
  const [status, setStatus] = useState('initializing');
  const [errorPersist, setErrorPersist] = useState(false);
  const resizeObserver = useRef(null);

  useEffect(() => {
  let didUnmount = false;
  setErrorPersist(false);

  // Clean up previous terminal and observer
  if (terminal.current) {
    try { terminal.current.dispose(); } catch {}
    terminal.current = null;
  }
  if (resizeObserver.current) {
    resizeObserver.current.disconnect();
    resizeObserver.current = null;
  }

  if (!terminalRef.current) return;
  
  setStatus('initializing');
  const timer = setTimeout(() => {
    if (didUnmount) return;

    terminal.current = new Terminal({
      theme: { background: '#1e1e1e', foreground: '#ffffff', cursor: '#ffffff' },
      fontFamily: 'monospace',
      fontSize: 14,
      cursorBlink: true,
      scrollback: 1000,
      allowProposedApi: true,
    });
    fitAddon.current = new FitAddon();
    terminal.current.loadAddon(fitAddon.current);
    // terminal.current.open(terminalRef.current);
    if (terminalRef.current) {
  requestAnimationFrame(() => {
    try {
      terminal.current.open(terminalRef.current);
      fitAddon.current.fit();
      setStatus('ready');
    } catch (err) {
      console.error('❌ Failed to open terminal:', err);
      setStatus('error');
      setErrorPersist(true);
      OnTerminalError(err.message)
    }
  });
} else {
  console.warn('❌ Terminal DOM ref not ready.');
  setStatus('error');
  setErrorPersist(true);
}


    setTimeout(() => {
      fitAddon.current.fit();
      setStatus('ready');
    }, 50);

    // ...WebSocket setup (same as before)...
    socket.current = new WebSocket('wss://codesync-backend-terminalrun.onrender.com'); // Replace with your WebSocket URL
    socket.current.onopen = () => {
      socket.current.send(JSON.stringify({ type: 'start', language }));
    };
    socket.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'output' && terminal.current) {
        terminal.current.write(msg.data);
        if(onCodeOutput) onCodeOutput();
      }
    };
    socket.current.onerror = (error) => {
      setStatus('error');
      setErrorPersist(true);

    };

    terminal.current.onData(data => {
      if (socket.current && socket.current.readyState === WebSocket.OPEN) {
        socket.current.send(JSON.stringify({ type: 'input', data }));
      }
    });

  }, 150); // 150ms delay

  return () => {
    didUnmount = true;
    clearTimeout(timer);
    if (terminal.current) {
      try { terminal.current.dispose(); } catch {}
    }
    if (socket.current) socket.current.close();
  };
}, [language, fitTrigger]);

useEffect(() => {
  if (fitAddon.current && terminalRef.current) {
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        try {
          fitAddon.current.fit();
        } catch (err) {
          console.error("Fit error", err);
        }
      })
    );
  }
}, [fitTrigger]);


  const RefreshTerminal = () =>{

    setStatus('initializing'); 
    setErrorPersist(false);

  if (terminal.current) {
    try { 
      terminal.current.dispose(); 
    } catch (err) {
      console.error('Error disposing terminal:', err);
    }
    terminal.current = null;
  }
  
  if (socket.current) {
    try {
      socket.current.close();
    } catch (err) {
      console.error('Error closing socket:', err);
    }
    socket.current = null;
  }

  // Force immediate reinitialization
  if (terminalRef.current) {
    terminal.current = new Terminal({
      theme: { background: '#1e1e1e', foreground: '#ffffff', cursor: '#ffffff' },
      fontFamily: 'monospace',
      fontSize: 14,
      cursorBlink: true,
      scrollback: 1000,
      allowProposedApi: true,
    });
    
    fitAddon.current = new FitAddon();
    terminal.current.loadAddon(fitAddon.current);
    // terminal.current.open(terminalRef.current);
    if (terminalRef.current) {
  requestAnimationFrame(() => {
    try {
      terminal.current.open(terminalRef.current);
      fitAddon.current.fit();
      setStatus('ready');
    } catch (err) {
      console.error('❌ Failed to open terminal:', err);
      setStatus('error');
      setErrorPersist(true);
      OnTerminalError("❌ Failed to open terminal")
    }
  });
} else {
  console.warn('❌ Terminal DOM ref not ready.');
  setStatus('error');
  setErrorPersist(true);
}


    // Fit and set ready status
    setTimeout(() => {
      try {
        fitAddon.current.fit();
        setStatus('ready');
      } catch (err) {
        console.error('Fit error:', err);
        setStatus('error');
      }
    }, 50);

    // Setup WebSocket connection
    socket.current = new WebSocket('wss://codesync-backend-terminalrun.onrender.com');
    socket.current.onopen = () => {
      socket.current.send(JSON.stringify({ type: 'start', language }));
    };
    socket.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'output' && terminal.current) {
        terminal.current.write(msg.data);
      }
    };
    socket.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setStatus('error');
      OnTerminalError("Connection Error")
    };

    terminal.current.onData(data => {
      if (socket.current && socket.current.readyState === WebSocket.OPEN) {
        socket.current.send(JSON.stringify({ type: 'input', data }));
      }
    });
    }
  }

  // Send code when runTrigger changes
    useEffect(() => {
      if (status !== 'ready') return;
      if (!socket.current || socket.current.readyState !== WebSocket.OPEN) return;

      // Add this map here:
      const filenameMap = {
        python: 'main.py',
        java: 'Main.java',
        cpp: 'main.cpp',
        javascript: 'main.js',
        go: 'main.go',
        ruby: 'main.rb',
        rust:'main.rs',
        php:'main.php',
        typescript:'main.ts',
        c: 'main.c',
        csharp: 'main.cs',
        dart: 'main.dart',
        swift: 'main.swift',
        sql: 'main.sql'
      };

      terminal.current.clear();
      socket.current.send(JSON.stringify({
        type: 'upload',
        filename: filenameMap[language] || 'main.txt',
        content: code
      }));
    }, [runTrigger, code, status, language]);

  if (status === 'error') {
    return (
      <div>
        <div style={{
          height: '100%',
          width: '100%',
          background: '#1e1e1e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ff5555',
          padding: '20px',
          textAlign: 'center'
        }}>
          Terminal failed to initialize. Please refresh the page or Switch the File
        </div>
        <button className='btn btn-danger' onClick={RefreshTerminal}>
          Refresh
        </button>      
      </div>
    );
  }

  return (
      <div style={{width: '100%', height: '100%'}}>
        <div
          ref={terminalRef}
          className='mobile-xterm'
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#1e1e1e',
            padding: '8px',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        ></div>
      </div>
  );
};

export default TerminalE;
