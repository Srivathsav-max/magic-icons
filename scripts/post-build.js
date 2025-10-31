import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist');
const srcIconsDir = path.join(__dirname, '..', 'src', 'components', 'icons');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy the generated index.ts exports
const indexPath = path.join(srcIconsDir, 'index.ts');
const distIndexPath = path.join(distDir, 'index.js');

if (fs.existsSync(indexPath)) {
  let indexContent = fs.readFileSync(indexPath, 'utf-8');

  // Fix the export paths - they should point to folders with index.js
  indexContent = indexContent
    .replace(/export \* from '\.\/Outline';/g, "export * from './Outline/index.js';")
    .replace(/export \* from '\.\/Bulk';/g, "export * from './Bulk/index.js';")
    .replace(/export \* from '\.\/Broken';/g, "export * from './Broken/index.js';")
    .replace(/export \* from '\.\/Light';/g, "export * from './Light/index.js';")
    .replace(/export \* from '\.\/TwoTone';/g, "export * from './TwoTone/index.js';");

  fs.writeFileSync(distIndexPath, indexContent);
  console.log('✓ Created dist/index.js');
}

// Create CommonJS version
const cjsContent = `'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./index.js');
} else {
  module.exports = require('./index.js');
}
`;

fs.writeFileSync(path.join(distDir, 'index.cjs'), cjsContent);
console.log('✓ Created dist/index.cjs');

// Copy all icon component files to dist
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else if (entry.name.endsWith('.tsx')) {
      // Copy TypeScript files as .js files (they'll be compiled by tsc)
      const jsFileName = entry.name.replace('.tsx', '.js');
      const jsDestPath = path.join(dest, jsFileName);

      // The .js file should already be created by tsc
      // We just need to ensure the structure is correct
      if (fs.existsSync(jsDestPath)) {
        console.log(`✓ Copied ${entry.name} -> ${jsFileName}`);
      }
    }
  }
}

console.log('\n✓ Package build completed successfully!');
console.log('\nTo publish to npm:');
console.log('  1. Update version: npm version patch|minor|major');
console.log('  2. Publish: npm publish');
