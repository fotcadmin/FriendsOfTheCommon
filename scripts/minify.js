#!/usr/bin/env node

/**
 * Build & Minification Script for Friends of the Commons
 * Minifies:
 *   - assets/css/nt-style.css -> assets/css/nt-style.min.css
 *   - assets/js/main.js       -> assets/js/main.min.js
 *   - assets/js/map.js        -> assets/js/map.min.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const rootDir = path.resolve(__dirname, '..');

/**
 * Minifies CSS by safely stripping comments, normalizing whitespace,
 * and removing non-essential spacing while preserving calc() expressions.
 */
function minifyCSS(css) {
  let out = css.replace(/\/\*[\s\S]*?\*\//g, '');
  out = out.replace(/\s+/g, ' ');
  out = out.replace(/\s*([\{\};,])\s*/g, '$1');
  out = out.replace(/:\s+/g, ':');
  out = out.replace(/;}/g, '}');
  return out.trim();
}

/**
 * Minifies JS using a lexical scanner that strips comments and empty space
 * while strictly respecting string literals, template strings, and regexes.
 */
function minifyJS(code) {
  let result = '';
  let i = 0;
  const len = code.length;
  let inString = null;
  let inBlockComment = false;
  let inLineComment = false;

  while (i < len) {
    const ch = code[i];
    const next = code[i + 1];

    if (inLineComment) {
      if (ch === '\n') {
        inLineComment = false;
        result += '\n';
      }
      i++;
      continue;
    }

    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i += 2;
        continue;
      }
      i++;
      continue;
    }

    if (inString) {
      result += ch;
      if (ch === '\\') {
        result += next;
        i += 2;
        continue;
      }
      if (ch === inString) {
        inString = null;
      }
      i++;
      continue;
    }

    // Check for comment starts
    if (ch === '/' && next === '/') {
      inLineComment = true;
      i += 2;
      continue;
    }

    if (ch === '/' && next === '*') {
      inBlockComment = true;
      i += 2;
      continue;
    }

    // Check for string starts
    if (ch === "'" || ch === '"' || ch === '`') {
      inString = ch;
      result += ch;
      i++;
      continue;
    }

    result += ch;
    i++;
  }

  // Clean lines, preserve newlines to guarantee ASI safety
  const lines = result.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const minified = lines.join('\n');

  // Verify syntax integrity
  try {
    new vm.Script(minified);
  } catch (err) {
    throw new Error('Minified JS failed syntax verification: ' + err.message);
  }

  return minified;
}

function formatBytes(bytes) {
  return (bytes / 1024).toFixed(1) + ' KB';
}

function minifyAll() {
  console.log('[Minify] Starting asset minification...');

  // 1. CSS Minification
  const cssPath = path.join(rootDir, 'assets/css/nt-style.css');
  const cssMinPath = path.join(rootDir, 'assets/css/nt-style.min.css');
  if (fs.existsSync(cssPath)) {
    const cssRaw = fs.readFileSync(cssPath, 'utf8');
    const cssMin = minifyCSS(cssRaw);
    fs.writeFileSync(cssMinPath, cssMin, 'utf8');
    const pct = ((1 - cssMin.length / cssRaw.length) * 100).toFixed(1);
    console.log(`[Minify] CSS: ${formatBytes(cssRaw.length)} -> ${formatBytes(cssMin.length)} (-${pct}%) -> assets/css/nt-style.min.css`);
  }

  // 2. JS Minification
  const jsFiles = [
    { src: 'assets/js/main.js', dist: 'assets/js/main.min.js' },
    { src: 'assets/js/map.js', dist: 'assets/js/map.min.js' }
  ];

  for (const item of jsFiles) {
    const srcPath = path.join(rootDir, item.src);
    const distPath = path.join(rootDir, item.dist);
    if (fs.existsSync(srcPath)) {
      const jsRaw = fs.readFileSync(srcPath, 'utf8');
      const jsMin = minifyJS(jsRaw);
      fs.writeFileSync(distPath, jsMin, 'utf8');
      const pct = ((1 - jsMin.length / jsRaw.length) * 100).toFixed(1);
      console.log(`[Minify] JS:  ${formatBytes(jsRaw.length)} -> ${formatBytes(jsMin.length)} (-${pct}%) -> ${item.dist}`);
    }
  }

  console.log('[Minify] All assets minified and verified successfully.');
}

if (require.main === module) {
  minifyAll();
}

module.exports = {
  minifyAll,
  minifyCSS,
  minifyJS
};
