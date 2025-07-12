const Docker = require('dockerode');
const tar = require('tar-stream');

const docker = new Docker();

const languageConfig = {
  python: {
    image: 'python:3.10',
    filename: 'main.py',
    cmd: ['python3', 'main.py'],
  },
  java: {
    image: 'openjdk:11',
    filename: 'Main.java',
    cmd: ['bash', '-c', 'javac Main.java && java Main'],
  },
  cpp: {
    image: 'gcc:latest',
    filename: 'main.cpp',
    cmd: ['bash', '-c', 'g++ main.cpp -o main && ./main'],
  },
  javascript: {
    image: 'node:18',
    filename: 'main.js',
    cmd: ['node', 'main.js'],
  },
};

async function runCodeWithInput(code, inputLines = [], language = 'python') {
  const config = languageConfig[language];
  if (!config) throw new Error(`Unsupported language: ${language}`);

  await docker.pull(config.image, (err, stream) => {
    if (err) throw err;
    docker.modem.followProgress(stream, () => {});
  });

  const container = await docker.createContainer({
    Image: config.image,
    Cmd: ['bash'],
    Tty: true,
    OpenStdin: true,
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
  });

  await container.start();

  // Write the code to the container
  const pack = tar.pack();
  pack.entry({ name: config.filename }, code);
  pack.finalize();
  await container.putArchive(pack, { path: '/' });

  // Prepare command
  const exec = await container.exec({
    Cmd: config.cmd,
    AttachStdout: true,
    AttachStderr: true,
    AttachStdin: true,
    Tty: false,
  });

  const stream = await exec.start({ hijack: true, stdin: true });

  let output = '';
  stream.on('data', chunk => {
    output += chunk.toString();
  });

  stream.on('error', err => {
    console.error('❌ Error in execution stream:', err);
  });

  // Provide simulated stdin input
  inputLines.forEach((line, index) => {
    setTimeout(() => {
      try {
        stream.write(line + '\n');
      } catch (e) {}
    }, index * 300);
  });

  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        await container.stop();
        await container.remove();
        resolve(output);
      } catch (err) {
        console.error('❌ Cleanup error:', err);
        resolve(output + '\n[Warning: Cleanup failed]');
      }
    }, inputLines.length * 300 + 2000);
  });
}

module.exports = runCodeWithInput;