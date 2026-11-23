#!/usr/bin/env node
// Preflight for an agent brief (R12): every input the brief names must be a file the agent can open,
// and the brief must carry the stop rule. Run it before launching any agent:
//   node checks/agent-brief.mjs path/to/brief.md [base directory for relative paths]
import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const INPUTS_HEADING = /^##\s+inputs\b/i;
const ANY_HEADING = /^#{1,6}\s/;
const STOP_RULE = /stops? and reports?/i;

// The paths listed under "## Inputs", one per bullet. Backticks and a trailing note after " : " are allowed.
export function parseBriefInputs(briefText) {
  const lines = briefText.split('\n');
  const start = lines.findIndex((line) => INPUTS_HEADING.test(line));
  if (start === -1) return null;
  const inputs = [];
  for (const line of lines.slice(start + 1)) {
    if (ANY_HEADING.test(line)) break;
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (!bullet) continue;
    const path = bullet[1].split(' : ')[0].replaceAll('`', '').trim();
    if (path) inputs.push(path);
  }
  return inputs;
}

// Problems as plain strings. An empty list means the brief may launch.
export function findBriefProblems(briefText, { baseDir = process.cwd(), fileExists = existsSync } = {}) {
  const problems = [];
  const inputs = parseBriefInputs(briefText);
  if (inputs === null) {
    problems.push('No "## Inputs" section. List every doc the agent must read as a file path, or write "- none".');
  } else if (inputs.length === 0) {
    problems.push('"## Inputs" is empty. List each file path, or write "- none".');
  } else {
    for (const input of inputs) {
      if (input.toLowerCase() === 'none') continue;
      const fullPath = isAbsolute(input) ? input : resolve(baseDir, input);
      if (!fileExists(fullPath)) problems.push(`Input is not a file the agent can open: ${input}`);
    }
  }
  if (!STOP_RULE.test(briefText)) {
    problems.push('No stop rule. Say that an agent who cannot open an input stops and reports, and never builds from a guess.');
  }
  return problems;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const [briefPath, baseDir] = process.argv.slice(2);
  if (!briefPath) {
    console.error('Usage: node checks/agent-brief.mjs <brief.md> [base directory]');
    process.exit(2);
  }
  const problems = findBriefProblems(readFileSync(briefPath, 'utf8'), { baseDir: baseDir ?? process.cwd() });
  if (problems.length === 0) {
    console.log('agent-brief: ok');
    process.exit(0);
  }
  for (const problem of problems) console.error(`agent-brief: ${problem}`);
  process.exit(1);
}
