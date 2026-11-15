#!/usr/bin/env node
// Rule R08: words a project has retired must not come back.
// Reads retired-terms.txt from the project root. Each line: term | reason | date
// Lines starting with # are comments. Matching ignores case and respects word edges.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { listTrackedFiles, isTextFile, readText, readProjectConfig, isIgnored, report } from './lib/files.mjs';

export const TERMS_FILE = 'retired-terms.txt';

export function parseRetiredTerms(fileText) {
  return fileText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const [term, reason = '', date = ''] = line.split('|').map((part) => part.trim());
      return { term, reason, date };
    })
    .filter((entry) => entry.term);
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function findRetiredTerms(rootDir) {
  const termsPath = join(rootDir, TERMS_FILE);
  if (!existsSync(termsPath)) return [`${TERMS_FILE} is missing. Add one, even if it only has comments.`];

  const terms = parseRetiredTerms(readText(rootDir, TERMS_FILE));
  const config = readProjectConfig(rootDir);
  const ignored = [TERMS_FILE, ...(config.retiredTerms?.ignore ?? [])];
  const matchers = terms.map((entry) => ({
    ...entry,
    pattern: new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegex(entry.term)}(?![\\p{L}\\p{N}])`, 'iu'),
  }));

  const findings = [];
  for (const relativePath of listTrackedFiles(rootDir)) {
    if (!isTextFile(relativePath) || isIgnored(relativePath, ignored)) continue;
    const lines = readText(rootDir, relativePath).split('\n');
    lines.forEach((line, index) => {
      for (const matcher of matchers) {
        if (matcher.pattern.test(line)) {
          findings.push(`${relativePath}:${index + 1} uses retired term "${matcher.term}" (${matcher.reason || 'no reason given'})`);
        }
      }
    });
  }
  return findings;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(report('retired-terms', findRetiredTerms(process.argv[2] ?? process.cwd())));
}
