#!/usr/bin/env node
// Rule R01: one home for everything. Flags the same paragraph or list block
// appearing in two or more Markdown files (docs, skills, handoffs).
// Code duplication is covered separately by jscpd in the shared workflow.
import { listTrackedFiles, readText, readProjectConfig, isIgnored, report } from './lib/files.mjs';

const MINIMUM_BLOCK_CHARACTERS = 160;

/** Lowercase, collapse whitespace and drop list markers so trivial edits still match. */
export function normalizeBlock(block) {
  return block
    .split('\n')
    .map((line) => line.replace(/^\s*(?:[-*+]|\d+\.)\s+/, '').trim())
    .join(' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
}

export function splitIntoBlocks(text) {
  const blocks = [];
  let current = [];
  let startLine = 1;
  text.split('\n').forEach((line, index) => {
    if (line.trim() === '' || line.startsWith('#') || line.startsWith('|')) {
      if (current.length) blocks.push({ text: current.join('\n'), line: startLine });
      current = [];
      startLine = index + 2;
      return;
    }
    if (!current.length) startLine = index + 1;
    current.push(line);
  });
  if (current.length) blocks.push({ text: current.join('\n'), line: startLine });
  return blocks;
}

export function findDocDuplicates(rootDir) {
  const config = readProjectConfig(rootDir);
  const ignored = config.docDuplicates?.ignore ?? [];
  const firstSeen = new Map();
  const findings = [];
  for (const relativePath of listTrackedFiles(rootDir)) {
    if (!relativePath.endsWith('.md') || isIgnored(relativePath, ignored)) continue;
    for (const block of splitIntoBlocks(readText(rootDir, relativePath))) {
      const key = normalizeBlock(block.text);
      if (key.length < MINIMUM_BLOCK_CHARACTERS) continue;
      const original = firstSeen.get(key);
      if (!original) {
        firstSeen.set(key, `${relativePath}:${block.line}`);
      } else if (!original.startsWith(`${relativePath}:`)) {
        findings.push(`${relativePath}:${block.line} repeats ${original}. Keep one home and link to it.`);
      }
    }
  }
  return findings;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(report('doc-duplicates', findDocDuplicates(process.argv[2] ?? process.cwd())));
}
