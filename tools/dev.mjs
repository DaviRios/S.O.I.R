import { spawn, spawnSync } from 'node:child_process';

const isWindows = process.platform === 'win32';
const children = new Map();
let stopping = false;

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
    stdio: ['ignore', 'inherit', 'inherit'],
    windowsHide: true,
    detached: !isWindows,
  });
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
