// Shared file helpers for every check. One home for "which files does a check look at".
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.pdf', '.zip', '.gz', '.tgz', '.br',
  '.mp3', '.mp4', '.wav', '.mov', '.woff', '.woff2', '.ttf', '.otf', '.epub',
]);

/** Files tracked by git in `rootDir`, so ignored and generated files are skipped. */
export function listTrackedFiles(rootDir) {
  const output = execFileSync('git', ['ls-files', '-z'], { cwd: rootDir, encoding: 'utf8' });
  return output.split('\0').filter(Boolean);
}

export function isTextFile(relativePath) {
  const dot = relativePath.lastIndexOf('.');
  const extension = dot === -1 ? '' : relativePath.slice(dot).toLowerCase();
  return !BINARY_EXTENSIONS.has(extension);
}

export function readText(rootDir, relativePath) {
  return readFileSync(join(rootDir, relativePath), 'utf8');
}

/** Reads standards.config.json from the project root. Missing file means defaults. */
export function readProjectConfig(rootDir) {
  const configPath = join(rootDir, 'standards.config.json');
  if (!existsSync(configPath)) return {};
  return JSON.parse(readFileSync(configPath, 'utf8'));
}

/** True when `relativePath` starts with any of the ignored path prefixes. */
export function isIgnored(relativePath, ignoredPrefixes = []) {
  return ignoredPrefixes.some((prefix) => relativePath === prefix || relativePath.startsWith(prefix));
}

/** Prints findings as file:line lines and returns the process exit code. */
export function report(checkName, findings) {
  if (findings.length === 0) {
    console.log(`${checkName}: pass`);
    return 0;
  }
  console.error(`${checkName}: ${findings.length} finding(s)`);
  for (const finding of findings) console.error(`  ${finding}`);
  return 1;
}
