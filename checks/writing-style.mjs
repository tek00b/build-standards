#!/usr/bin/env node
// Rule R31: the owner's writing rules in anything people read: no em dashes,
// no "it's not X, it's Y". Runs on docs and page files; projects can add paths.
import { listTrackedFiles, readText, readProjectConfig, isIgnored, report } from './lib/files.mjs';

const DEFAULT_EXTENSIONS = /\.(md|mdx|html|txt|astro|jsx|tsx|svelte|vue)$/;
const EM_DASH = '—';
// "it's not X, it's Y" and close cousins ("this isn't X, it's Y", "not X but Y" is allowed).
const NOT_X_ITS_Y = /\b(it'?s|it is|this is|that'?s|this isn'?t|it isn'?t)\s+(not\s+)?[^.;:!?\n]{1,60}?[,;]\s*(it'?s|it is)\b/i;

export function findStyleProblemsInText(text) {
  const problems = [];
  text.split('\n').forEach((line, index) => {
    if (line.includes(EM_DASH)) problems.push({ line: index + 1, problem: 'em dash' });
    // A quoted or code-formatted example describes the pattern; it does not use it.
    const unquoted = line.replace(/"[^"]*"|“[^”]*”|`[^`]*`/g, '');
    const match = unquoted.match(NOT_X_ITS_Y);
    if (match && /\bnot\b|n'?t\b/i.test(match[0])) problems.push({ line: index + 1, problem: '"it\'s not X, it\'s Y" pattern' });
  });
  return problems;
}

export function findWritingStyleProblems(rootDir) {
  const config = readProjectConfig(rootDir);
  const ignored = config.writingStyle?.ignore ?? [];
  const findings = [];
  for (const relativePath of listTrackedFiles(rootDir)) {
    if (!DEFAULT_EXTENSIONS.test(relativePath) || isIgnored(relativePath, ignored)) continue;
    for (const { line, problem } of findStyleProblemsInText(readText(rootDir, relativePath))) {
      findings.push(`${relativePath}:${line} ${problem}`);
    }
  }
  return findings;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(report('writing-style', findWritingStyleProblems(process.argv[2] ?? process.cwd())));
}
