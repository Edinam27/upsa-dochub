const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Copy static files to standalone directory if they don't exist
const standaloneDir = path.join(__dirname, '.next/standalone');
const staticDir = path.join(__dirname, '.next/static');
const publicDir = path.join(__dirname, 'public');
const standaloneStaticDir = path.join(standaloneDir, '.next/static');
const standalonePublicDir = path.join(standaloneDir, 'public');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Setting up standalone deployment...');

// Copy static files
if (fs.existsSync(staticDir)) {
  console.log('Copying static files...');
  copyDir(staticDir, standaloneStaticDir);
}

// Copy public files
if (fs.existsSync(publicDir)) {
  console.log('Copying public files...');
  copyDir(publicDir, standalonePublicDir);
}

console.log('Starting server...');

// Start the standalone server
const serverPath = path.join(standaloneDir, 'server.js');
const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  cwd: standaloneDir
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  server.kill('SIGINT');
});