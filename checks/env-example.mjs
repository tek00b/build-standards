#!/usr/bin/env node
// Rule R02: every environment variable the code reads is listed in .env.example,
// and .env.example holds names only, never values.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { listTrackedFiles, readText, readProjectConfig, isIgnored, report } from './lib/files.mjs';

const CODE_EXTENSIONS = /\.(m?[jt]sx?|cjs|py)$/;
const ENV_READ_PATTERNS = [
  /process\.env\.([A-Z][A-Z0-9_]*)/g,
  /process\.env\[['"]([A-Z][A-Z0-9_]*)['"]\]/g,
  /import\.meta\.env\.([A-Z][A-Z0-9_]*)/g,
  /Deno\.env\.get\(['"]([A-Z][A-Z0-9_]*)['"]\)/g,
  /os\.environ(?:\.get\(|\[)['"]([A-Z][A-Z0-9_]*)['"]/g,
];
// Set by the platform, never by us, so they do not belong in .env.example.
const PLATFORM_VARIABLES = new Set(['NODE_ENV', 'CI', 'VERCEL', 'VERCEL_ENV', 'VERCEL_URL', 'VERCEL_GIT_COMMIT_SHA', 'PORT', 'HOME', 'PATH']);

export function parseEnvExample(fileText) {
  const entries = new Map();
  fileText.split('\n').forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const equals = trimmed.indexOf('=');
    const name = (equals === -1 ? trimmed : trimmed.slice(0, equals)).trim();
    const value = equals === -1 ? '' : trimmed.slice(equals + 1).trim();
    entries.set(name, { value, line: index + 1 });
  });
  return entries;
}

export function findEnvExampleProblems(rootDir) {
  const config = readProjectConfig(rootDir);
  const ignored = config.envExample?.ignore ?? [];
  const allowed = new Set([...PLATFORM_VARIABLES, ...(config.envExample?.platformVariables ?? [])]);
  const examplePath = join(rootDir, '.env.example');
  const example = existsSync(examplePath) ? parseEnvExample(readText(rootDir, '.env.example')) : new Map();

  const findings = [];
  const seen = new Set();
  for (const relativePath of listTrackedFiles(rootDir)) {
    if (!CODE_EXTENSIONS.test(relativePath) || isIgnored(relativePath, ignored)) continue;
    const text = readText(rootDir, relativePath);
    for (const pattern of ENV_READ_PATTERNS) {
      for (const match of text.matchAll(pattern)) {
        const name = match[1];
        if (allowed.has(name) || example.has(name) || seen.has(name)) continue;
        seen.add(name);
        const line = text.slice(0, match.index).split('\n').length;
        findings.push(`${relativePath}:${line} reads ${name}, which is not listed in .env.example`);
      }
    }
  }
  for (const [name, { value, line }] of example) {
    if (value && !/^<.*>$/.test(value)) {
      findings.push(`.env.example:${line} gives ${name} a value. List names only, or a <placeholder>.`);
    }
  }
  return findings;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(report('env-example', findEnvExampleProblems(process.argv[2] ?? process.cwd())));
}
