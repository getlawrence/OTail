#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory (ES Module equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const wasmDir = path.join(__dirname, '../wasm/ottl');
const publicWasmDir = path.join(__dirname, '../public/wasm');

// Ensure public/wasm directory exists
if (!fs.existsSync(publicWasmDir)) {
  fs.mkdirSync(publicWasmDir, { recursive: true });
  console.log('Created directory:', publicWasmDir);
}

try {
  // Run make to build the WASM
  console.log('Building OTTL WASM...');
  execSync('make build', { cwd: wasmDir, stdio: 'inherit' });
  console.log('OTTL WASM built successfully!');

  // Verify files were created
  const wasmPath = path.join(publicWasmDir, 'ottl.wasm');
  const jsPath = path.join(publicWasmDir, 'wasm_exec.js');
  
  if (fs.existsSync(wasmPath) && fs.existsSync(jsPath)) {
    console.log('WASM files generated successfully:');
    console.log('- ' + wasmPath);
    console.log('- ' + jsPath);
  } else {
    console.error('WASM files were not generated correctly.');
    process.exit(1);
  }
} catch (error) {
  console.error('Error building WASM:', error.message);
  process.exit(1);
}
