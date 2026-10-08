import { spawn, spawnSync } from 'node:child_process';
import { Transform } from 'node:stream';

const isWindows = process.platform === 'win32';
const children = new Map();
let stopping = false;

function prefixLines(name) {
  let pending = '';

  return new Transform({
    transform(chunk, _encoding, callback) {
      const lines = `${pending}${chunk.toString()}`.split(/\r?\n/);
      pending = lines.pop() ?? '';
      callback(
        null,
        lines
          .filter((line) => line.length > 0)
          .map((line) => `[${name}] ${line}\n`)
          .join(''),
      );
    },
    flush(callback) {
      if (pending) this.push(`[${name}] ${pending}\n`);
      callback();
    },
  });
}

function stopProcessTree(child) {
  if (!child.pid) return;
  if (isWindows) {
    const result = spawnSync(
      'taskkill',
      ['/PID', String(child.pid), '/T', '/F'],
      {
        stdio: 'ignore',
        windowsHide: true,
      },
    );
    if (result.status !== 0) child.kill();
    return;
  }
  try {
    process.kill(-child.pid, 'SIGTERM');
  } catch {
    // The process may already have exited.
  }
}

function shutdown(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  if (process.stdin.isTTY) process.stdin.setRawMode(false);
  process.stdin.pause();
  for (const child of children.values()) stopProcessTree(child);
  process.exitCode = exitCode;
}

function start(name, script) {
  const command = isWindows ? (process.env.ComSpec ?? 'cmd.exe') : 'npm';
  const args = isWindows
    ? ['/d', '/s', '/c', `npm run ${script}`]
    : ['run', script];
  const child = spawn(command, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
    detached: !isWindows,
  });
  child.stdout.pipe(prefixLines(name)).pipe(process.stdout, { end: false });
  child.stderr.pipe(prefixLines(name)).pipe(process.stderr, { end: false });
  children.set(name, child);
  child.once('error', (error) => {
    console.error(`[${name}] Falha ao iniciar: ${error.message}`);
    shutdown(1);
  });
  child.once('exit', (code, signal) => {
    children.delete(name);
    if (!stopping) {
      const reason = signal ? `sinal ${signal}` : `código ${code ?? 1}`;
      console.error(`[${name}] Servidor encerrado (${reason}).`);
      shutdown(code ?? 1);
    }
  });
}

process.once('SIGINT', () => shutdown(0));
process.once('SIGTERM', () => shutdown(0));
process.once('SIGHUP', () => shutdown(0));
if (process.stdin.isTTY) process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', (input) => {
  if (input.includes(3)) shutdown(0);
});

start('back', 'dev:back');
start('front', 'dev:front');
