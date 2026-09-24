import { spawn } from 'child_process';

console.log('🚀 Starting ResQ — Emergency Response & Service Locator Environment...');

const server = spawn('npm', ['run', 'dev'], { 
  cwd: 'server', 
  shell: true, 
  stdio: 'inherit' 
});

const client = spawn('npm', ['run', 'dev'], { 
  cwd: 'client', 
  shell: true, 
  stdio: 'inherit' 
});

const cleanup = () => {
  console.log('\nStopping development servers...');
  server.kill();
  client.kill();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
