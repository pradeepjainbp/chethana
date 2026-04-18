#!/usr/bin/env node
// Flags competitive language in Vaidya content, prompts, and UI copy.
// The Vaidya never pushes, beats, challenges, records, crushes, dominates, hacks.
// Add `// voice-lint-ignore` on the flagged line (or the line above) for legitimate
// scientific uses (e.g. "anabolic hormones dominate" in physiology copy).

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const BANNED = [
  'push', 'beat', 'challenge', 'record',
  'crush', 'dominate', 'hack', 'bulletproof',
];
const RE = new RegExp(`\\b(${BANNED.join('|')})\\b`, 'i');

// Extract quoted string literals from a single line (single, double, backtick).
// Returns [{ text, col }] where col is 1-based column of the opening quote + 1.
function extractStrings(line) {
  const out = [];
  let i = 0;
  while (i < line.length) {
    const ch = line[i];
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      const start = i + 1;
      let j = start;
      while (j < line.length) {
        if (line[j] === '\\') { j += 2; continue; }
        if (line[j] === quote) break;
        j++;
      }
      out.push({ text: line.slice(start, j), col: start });
      i = j + 1;
    } else {
      i++;
    }
  }
  return out;
}

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (['node_modules', '.next', '.open-next', 'dist'].includes(name)) continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, files);
    else if (/\.(ts|tsx|mjs|md)$/.test(name)) files.push(p);
  }
  return files;
}

const roots = ['src'];
const files = roots.flatMap(r => {
  try { return walk(join(process.cwd(), r)); }
  catch { return []; }
});

let violations = 0;

for (const file of files) {
  const rel = relative(process.cwd(), file);
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  const isMd = file.endsWith('.md');
  let inCodeFence = false;

  lines.forEach((line, idx) => {
    if (isMd && /^```/.test(line)) { inCodeFence = !inCodeFence; return; }
    if (isMd && inCodeFence) return;

    if (/voice-lint-ignore/.test(line)) return;
    if (idx > 0 && /voice-lint-ignore/.test(lines[idx - 1])) return;

    const blocks = isMd ? [{ text: line, col: 0 }] : extractStrings(line);
    for (const { text, col } of blocks) {
      const m = text.match(RE);
      if (m) {
        const column = col + (m.index ?? 0) + 1;
        console.error(`${rel}:${idx + 1}:${column}  voice-lint: "${m[0]}" — competitive language`);
        violations++;
      }
    }
  });
}

if (violations > 0) {
  console.error(`\n${violations} voice-lint violation(s). Add \`// voice-lint-ignore\` for legitimate uses.`);
  process.exit(1);
}
console.log('voice-lint: no competitive language detected.');
