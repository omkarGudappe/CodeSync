const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const Docker = require('dockerode');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

const docker = new Docker();
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const sessions = new Map();

const SECURITY_CONFIG = {
  memoryMB: 100,            
  cpuShares: 512,          
  pidsLimit: 20,
  networkDisabled: true,
  autoRemove: true 
};

const IMAGE_CONFIG = {
  // python: {
  //   image: 'python:3.10-slim',
  //   shell: '/bin/bash',
  //   initCmd: 'python -i'
  // },
  // java: {
  //   image: 'openjdk:17-slim',
  //   shell: '/bin/bash',
  //   initCmd: 'jshell'
  // },
  // cpp: {
  //   image: 'gcc:latest',
  //   shell: '/bin/bash',
  //   initCmd: 'bash'
  // },
  // javascript: {
  //   image: 'node:18-slim',
  //   shell: '/bin/sh',
  //   initCmd: 'node'
  // },
  //   go: {
  //   image: 'golang:latest',
  //   shell: '/bin/bash',
  //   initCmd: 'go run main.go'
  // },
  // ruby: {
  //   image: 'ruby:latest',
  //   shell: '/bin/bash',
  //   initCmd: 'irb'
  // },
  // rust:{
  //  image: 'rust:latest',
  //  shell: '/bin/bash',
  //  initCmd: 'rustc main.rs -o main',
  // },
  // php:{
  //   image : 'php:latest',
  //   shell: '/bin/bash',
  //   initCmd : 'php main.php',
  // },
  // typescript: {
  //   image: 'node:18',
  //   shell:'/bin/bash',
  //   initCmd : 'tsc main.ts',
  // },
  // c: {
  //   image: "gcc:latest",
  //   shell: "/bin/bash",
  //   initCmd: "gcc main.c -o main && ./main"
  // },
  // csharp: {
  //   image: "mcr.microsoft.com/dotnet/sdk:latest",
  //   shell: "/bin/bash",
  //   initCmd: "dotnet new console -o app && mv main.cs app/Program.cs && cd app && dotnet run"
  // },
  // dart: {
  //   image: "dart:latest",
  //   shell: "/bin/bash",
  //   initCmd: "dart run main.dart"
  // },
  // swift: {
  //   image: "swift:latest",
  //   shell: "/bin/bash",
  //   initCmd: "swiftc main.swift -o main && ./main"
  // }, 
  // sql: {
  //   image: "nouchka/sqlite3",
  //   shell: "/bin/sh",
  //   initCmd:  (code) => `echo "${code.replace(/"/g, '\\"')}" | sqlite3`
  // },
    python: {
    image: 'python:3.10-slim',
    filename: 'main.py',
    compileCmd: null,
    runCmd: ['python3', 'main.py'],
    timeout: 5000
  },
  java: {
    image: 'openjdk:17-slim',
    filename: 'Main.java',
    compileCmd: ['javac', 'Main.java'],
    runCmd: ['java', 'Main'],
    timeout: 10000
  },
  cpp: {
    image: 'gcc:latest',
    filename: 'main.cpp',
    compileCmd: ['g++', 'main.cpp', '-o', 'main'],
    runCmd: ['./main'],
    timeout: 8000
  },
  javascript: {
    image: 'node:18-slim',
    filename: 'main.js',
    compileCmd: null,
    runCmd: ['node', 'main.js'],
    timeout: 5000
  },
  go: {
    image: 'golang:latest',
    filename: 'main.go',
    compileCmd: null,
    runCmd: ['go', 'run', 'main.go'],
    timeout: 8000
  },
  ruby: {
    image: 'ruby:latest',
    filename: 'main.rb',
    compileCmd: null,
    runCmd: ['ruby', 'main.rb'],
    timeout: 5000
  },
  rust: {
    image: 'rust:latest',
    filename: 'main.rs',
    compileCmd: ['rustc', 'main.rs', '-o', 'main'],
    runCmd: ['./main'],
    timeout: 10000
  },
  php: {
    image: 'php:latest',
    filename: 'main.php',
    compileCmd: null,
    runCmd: ['php', 'main.php'],
    timeout: 5000
  },
  typescript: {
    image: 'typescript-env:latest',
    filename: 'main.ts',
    compileCmd: ['tsc', 'main.ts'],
    runCmd: ['node', 'main.js'],
    timeout: 8000
  },
  c: {
    image: 'gcc:latest',
    filename: 'main.c',
    compileCmd: ['gcc', 'main.c', '-o', 'main'],
    runCmd: ['./main'],
    timeout: 8000
  },
  csharp: {
    image: 'mcr.microsoft.com/dotnet/sdk:latest',
    filename: 'main.cs',
    compileCmd: ['dotnet', 'new', 'console', '--force', '--output', '/app'],
    runCmd: ['dotnet', 'run', '--project', '/app'],
    timeout: 10000,
    preUpload: async (container, code) => {
      const pack = tar.pack();
      pack.entry({ name: 'Program.cs' }, code);
      pack.finalize();
      await container.putArchive(pack, { path: '/app' });
    }
  },
  dart: {
    image: 'dart:latest',
    filename: 'main.dart',
    compileCmd: null,
    runCmd: ['dart', 'main.dart'],
    timeout: 5000
  },
  swift: {
    image: 'swift:latest',
    filename: 'main.swift',
    compileCmd: ['swiftc', 'main.swift', '-o', 'main'],
    runCmd: ['./main'],
    timeout: 10000
  },
  sql: {
    image: 'nouchka/sqlite3',
    filename: 'main.sql',
    compileCmd: null,
    runCmd: ['sqlite3', ':memory:', '.read', 'main.sql'],
    timeout: 5000,
    isInteractive: false,
  },
  default: {
    image: 'ubuntu:latest',
    shell: '/bin/bash',
    initCmd: 'bash'
  }
};

// Pull required images on startup
async function pullImages() {
  const images = new Set(
    Object.values(IMAGE_CONFIG).map(config => config.image)
  );
  
  for (const image of images) {
    try {
      console.log(`Pulling image: ${image}`);
      await new Promise((resolve, reject) => {
        docker.pull(image, (err, stream) => {
          if (err) return reject(err);
          
          docker.modem.followProgress(stream, (err, output) => {
            if (err) reject(err);
            else resolve(output);
          });
        });
      });
      console.log(`Successfully pulled ${image}`);
    } catch (err) {
      console.error(`Failed to pull ${image}:`, err.message);
    }
  }
}

wss.on('connection', (ws) => {
  const sessionId = uuidv4();
  console.log(`New connection: ${sessionId}`);

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`Message received (${sessionId}):`, data.type);

      if (data.type === 'start') {
        const { language = 'default' } = data;
        sessionLanguage = language;
        const config = IMAGE_CONFIG[language] || IMAGE_CONFIG.default;
        const container = await docker.createContainer({
          Image: config.image,
          Tty: true,
          OpenStdin: true,
          StdinOnce: false,
          AttachStdin: true,
          AttachStdout: true,
          AttachStderr: true,
          Cmd: (language === 'sql') ? ['sleep', '3600'] :  ['/bin/bash', '-i'],
          HostConfig: {
            Memory: SECURITY_CONFIG.memoryMB * 1024 * 1024,
            CpuShares: SECURITY_CONFIG.cpuShares,
            PidsLimit: SECURITY_CONFIG.pidsLimit,
            NetworkMode: SECURITY_CONFIG.networkDisabled ? 'none' : 'bridge',
            AutoRemove: SECURITY_CONFIG.autoRemove
          },
          Env: [
            'TERM=xterm-256color',
            'PYTHONUNBUFFERED=1',
            'LANG=C.UTF-8',
            'LC_ALL=C.UTF-8'
          ]
        });

        await container.start();

        if (language === 'python') {
          sessions.set(sessionId, {
            container,
            stream: null,
            language: 'python'
          });
          // For Python, don't start a shell, just wait for upload to run the script.
          // Optionally, you can send a welcome message:
          ws.send(JSON.stringify({
            type: 'output',
            data: 'Python container ready. Click "Run in Terminal" to execute your code.\r\n'
          }));
        } else if (language !== 'sql') {

          ws.send(JSON.stringify({
            type: 'output',
            data: `${sessionLanguage} ${sessionLanguage === 'javascript' ? 'Console' : 'Terminal'} ready. Click "Run in Terminal" to execute your code.\r\n`
          }));

          const exec = await container.exec({
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
            Cmd: [config.shell]
          });

          const stream = await exec.start({ hijack: true, stdin: true });
          sessions.set(sessionId, {
            container,
            stream,
            language
          });

          stream.on('data', (chunk) => {
            const cleanOutput = chunk.toString('utf-8')
              .replace(/\x1B\[[?]2004[hl]/g, '')  // Remove bracketed paste
              .replace(/\r?\n/g, '\r\n');
            ws.send(JSON.stringify({
              type: 'output',
              data: cleanOutput
            }));
          });

          stream.on('error', (err) => {
            console.error(`Stream error (${sessionId}):`, err);
            ws.send(JSON.stringify({
              type: 'error',
              data: 'Terminal connection error'
            }));
          });
        }
      }

else if (data.type === 'upload') {
  const session = sessions.get(sessionId);
  if (!session) return;
  const lang = session.language;

  const filenameMap = {
    python: 'main.py',
    java: 'Main.java',
    cpp: 'main.cpp',
    javascript: 'main.js',
    go: 'main.go',
    ruby: 'main.rb',
    rust: 'main.rs',
    php: 'main.php',
    typescript:'main.ts',
    c: 'main.c',
    csharp: 'main.cs',
    dart: 'main.dart',
    swift: 'main.swift',
    sql: 'main.sql'
  };
  const filename = filenameMap[lang] || 'main.txt';

  // 1. Copy code file into the container
  const tar = require('tar-stream');
  const pack = tar.pack();
  pack.entry({ name: filename }, data.content);
  pack.finalize();
  // await session.container.putArchive(pack, { path: '/' });
  const targetPath = (lang === 'go') ? '/go' : lang === 'dart' ? '/root' : '/';
await session.container.putArchive(pack, { path: targetPath });

  // 2. Stop old exec if present
  if (session.stream) session.stream.end();

  // 3. Launch exec for the language
  let execCmd;
  if (lang === 'python') {
    execCmd = ['python3', '-u', filename];
  } else if (lang === 'java') {
    execCmd = ['/bin/bash', '-c', 'javac Main.java && java Main'];
  } else if (lang === 'cpp') {
    execCmd = ['/bin/bash', '-c', 'g++ main.cpp -o main && ./main'];
  } else if (lang === 'javascript') {
    execCmd = ['node', filename];
  }else if (lang === 'go') {
  execCmd = ['/bin/bash', '-c', 'go run main.go'];
  } else if (lang === 'ruby') {
    execCmd = ['ruby', filename];
  } else if(lang === 'rust'){
    execCmd = ['/bin/bash', '-c', 'rustc main.rs -o main && ./main'];
  } else if(lang==='php'){
    execCmd = ['php' ,filename];
  } else if(lang === 'typescript'){
      execCmd = ['/bin/bash', '-c', 'tsc main.ts && node main.js'];
  }else if (lang === 'c') {
    execCmd = ['/bin/bash', '-c', 'gcc main.c -o main && ./main'];
  } else if (lang === 'csharp') {
    execCmd = ['/bin/bash', '-c', 'dotnet new console -o app --force && mv main.cs app/Program.cs && cd app && dotnet run'];
  } else if (lang === 'dart') {
    execCmd = ['dart', '/root/main.dart'];
  } else if (lang === 'swift') {
    execCmd = ['/bin/bash', '-c', 'swiftc main.swift -o main && ./main'];
  } else if (lang === 'sql') {
    const config = IMAGE_CONFIG['sql'];
    const container = await docker.createContainer({
      Image: config.image,
      Tty: true,
      OpenStdin: false,
      AttachStdin: false,
      AttachStdout: true,
      AttachStderr: true,
      Cmd: ['sleep', '10'],
      HostConfig: {
        AutoRemove: true,
        Memory: SECURITY_CONFIG.memoryMB * 1024 * 1024,
        CpuShares: SECURITY_CONFIG.cpuShares,
        PidsLimit: SECURITY_CONFIG.pidsLimit,
        NetworkMode: SECURITY_CONFIG.networkDisabled ? 'none' : 'bridge',
      }
    });
    await container.start();

    // Upload SQL file
    const tar = require('tar-stream');
    const pack = tar.pack();
    pack.entry({ name: 'main.sql' }, data.content);
    pack.finalize();
    await container.putArchive(pack, { path: '/' });

    // Exec SQL and stream output
    const exec = await container.exec({
      AttachStdout: true,
      AttachStderr: true,
      Tty: false,
      Cmd: ['sqlite3', ':memory:', '.read', 'main.sql']
    });
    const stream = await exec.start({ hijack: true, stdin: false });

    stream.on('data', chunk => {
      ws.send(JSON.stringify({ type: 'output', data: chunk.toString('utf-8') }));
    });
    stream.on('end', async () => {
      await container.stop().catch(() => {});
      await container.remove().catch(() => {});
    });
    stream.on('error', err => {
      ws.send(JSON.stringify({ type: 'output', data: `Error: ${err.message}` }));
    });
    return;
  }else {
    execCmd = ['/bin/bash', '-c', `cat ${filename}`];
  }
  const exec = await session.container.exec({
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
    Cmd: execCmd
  });
  const stream = await exec.start({ hijack: true, stdin: true });
  console.log('LANG:', lang, 'FILENAME:', filename);

  // Save reference for input streaming
  session.stream = stream;
  sessions.set(sessionId, session);

  // Pipe output back
  stream.on('data', chunk => {
    ws.send(JSON.stringify({ type: 'output', data: chunk.toString('utf-8') }));
  });
  stream.on('error', err => {
    ws.send(JSON.stringify({ type: 'output', data: `Error: ${err.message}` }));
  });
}


      else if (data.type === 'input') {
        const session = sessions.get(sessionId);
        if (session && session.stream) {
          session.stream.write(data.data);
        }
      }
      // if (data.type === 'input') {
      //   const session = sessions.get(sessionId);
      //   if (session && session.stream) {
      //     session.stream.write(data.data);
      //   }
      // }
    } catch (err) {
      console.error(`Error handling message (${sessionId}):`, err);
      ws.send(JSON.stringify({
        type: 'error',
        data: `Error: ${err.message}`
      }));
    }
  });

  ws.on('close', async () => {
    console.log(`Connection closed: ${sessionId}`);
    try {
      const session = sessions.get(sessionId);
      if (session) {
        if (session.stream) {
          session.stream.end();
        }
        if (session.container) {
          await session.container.stop().catch(e => 
            console.error(`Stop error (${sessionId}):`, e));
          await session.container.remove().catch(e => 
            console.error(`Remove error (${sessionId}):`, e));
        }
        sessions.delete(sessionId);
      }
    } catch (err) {
      console.error(`Cleanup error (${sessionId}):`, err);
    }
  });
});

// Pull images when starting
pullImages().then(() => {
  const PORT = 5000;
  server.listen(process.env.TerminalPORT || 5000 () => {
    console.log(`🖥️ Terminal server running on ws://localhost:${PORT}`);
    console.log('Supported languages:', Object.keys(IMAGE_CONFIG));
  });
}).catch(err => {
  console.error('Failed to initialize:', err);
  process.exit(1);
});
