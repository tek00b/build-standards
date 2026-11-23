// Each check is tested on a throwaway git repo: one case that must pass, one that must fail.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { findRetiredTerms, parseRetiredTerms } from '../checks/retired-terms.mjs';
import { findEnvExampleProblems } from '../checks/env-example.mjs';
import { findDocDuplicates } from '../checks/doc-duplicates.mjs';
import { findKeyAccountProblems } from '../checks/key-account.mjs';
import { findStyleProblemsInText } from '../checks/writing-style.mjs';
import { findBriefProblems, parseBriefInputs } from '../checks/agent-brief.mjs';

test('writing style: flags em dashes and "it\'s not X, it\'s Y", allows plain contrast', () => {
  const text = [
    'Clean code — always.',
    "It's not a game, it's a simulation.",
    "Universities aren't dead, but many are dying.",
    "It's fast, and it's free.",
    'No "it\'s not X, it\'s Y" in copy.',
  ].join('\n');
  const problems = findStyleProblemsInText(text);
  assert.deepEqual(problems.map((problem) => problem.line), [1, 2]);
});

function makeRepo(files) {
  const rootDir = mkdtempSync(join(tmpdir(), 'standards-'));
  execFileSync('git', ['init', '-q'], { cwd: rootDir });
  for (const [relativePath, content] of Object.entries(files)) {
    mkdirSync(dirname(join(rootDir, relativePath)), { recursive: true });
    writeFileSync(join(rootDir, relativePath), content);
  }
  execFileSync('git', ['add', '-A'], { cwd: rootDir });
  return rootDir;
}

test('retired terms: parses term, reason and date', () => {
  const entries = parseRetiredTerms('# comment\nold slogan | brand rule | 2026-11-13\nOldname|renamed|2026-10-30\n');
  assert.deepEqual(entries.map((entry) => entry.term), ['old slogan', 'Oldname']);
  assert.equal(entries[0].reason, 'brand rule');
});

test('retired terms: flags a retired term with file and line', () => {
  const rootDir = makeRepo({
    'retired-terms.txt': 'old slogan | brand rule | 2026-11-13\n',
    'src/page.html': '<h1>Welcome</h1>\n<p>Old Slogan games</p>\n',
  });
  const findings = findRetiredTerms(rootDir);
  assert.equal(findings.length, 1);
  assert.match(findings[0], /^src\/page\.html:2 /);
});

test('retired terms: respects word edges and the terms file itself', () => {
  const rootDir = makeRepo({
    'retired-terms.txt': 'X | platform retired | 2026-11-01\n',
    'notes.md': 'Max uses Xbox and the X-axis.\n',
  });
  // "X-axis" is a whole word X, so it is flagged; "Max" and "Xbox" are not.
  const findings = findRetiredTerms(rootDir);
  assert.equal(findings.length, 1);
  assert.match(findings[0], /notes\.md:1/);
});

test('retired terms: a missing terms file fails', () => {
  const rootDir = makeRepo({ 'a.md': 'hello\n' });
  assert.equal(findRetiredTerms(rootDir).length, 1);
});

test('env example: passes when every variable read is listed', () => {
  const rootDir = makeRepo({
    '.env.example': 'STRIPE_SECRET_KEY=\nSITE_URL=<https://example.com>\n',
    'api/pay.js': 'const key = process.env.STRIPE_SECRET_KEY; const url = process.env.SITE_URL; const mode = process.env.NODE_ENV;\n',
  });
  assert.deepEqual(findEnvExampleProblems(rootDir), []);
});

test('env example: flags an unlisted variable and a real value', () => {
  const rootDir = makeRepo({
    '.env.example': 'RESEND_API_KEY=re_live_123\n',
    'api/mail.js': 'const key = process.env.RESEND_API_KEY;\nconst hook = process.env["WEBHOOK_SECRET"];\n',
  });
  const findings = findEnvExampleProblems(rootDir);
  assert.equal(findings.length, 2);
  assert.ok(findings.some((finding) => finding.startsWith('api/mail.js:2 reads WEBHOOK_SECRET')));
  assert.ok(findings.some((finding) => finding.includes('gives RESEND_API_KEY a value')));
});

test('doc duplicates: flags the same block in two files, ignores short lines', () => {
  const block = 'Hardcoded or default secrets, keys in front-end code, debug mode left on. Secrets live only in the host secret store. Scan for them on every change, and never print them.';
  const rootDir = makeRepo({
    'coder.md': `# Coder\n\n- ${block}\n\nShort line.\n`,
    'reviewer.md': `# Reviewer\n\n${block.toUpperCase()}\n\nShort line.\n`,
  });
  const findings = findDocDuplicates(rootDir);
  assert.equal(findings.length, 1);
  assert.match(findings[0], /repeats coder\.md:3/);
});

test('key account: unknown service and missing key both fail, no network needed', async () => {
  const rootDir = makeRepo({
    'standards.config.json': JSON.stringify({ accounts: { stripe: { accountId: 'acct_expected' }, mailchimp: {} } }),
  });
  const findings = await findKeyAccountProblems(rootDir, {});
  assert.ok(findings.some((finding) => finding.includes('STRIPE_SECRET_KEY is not set')));
  assert.ok(findings.some((finding) => finding.startsWith('mailchimp: no check exists')));
});

test('key account: Supabase URL for the wrong project fails before any network call', async () => {
  const rootDir = makeRepo({
    'standards.config.json': JSON.stringify({ accounts: { supabase: { projectRef: 'expectedprojectref000' } } }),
  });
  const findings = await findKeyAccountProblems(rootDir, { SUPABASE_URL: 'https://otherprojectref00000.supabase.co' });
  assert.equal(findings.length, 1);
  assert.match(findings[0], /expected expectedprojectref000/);
});

test('agent brief: passes when every input exists and the stop rule is there', () => {
  const brief = '# Brief\n\n## Inputs\n- `docs/specs/a.md` : the spec\n- /abs/b.md\n\n## Stop rule\nThe agent stops and reports.\n';
  assert.deepEqual(parseBriefInputs(brief), ['docs/specs/a.md', '/abs/b.md']);
  const opened = [];
  const problems = findBriefProblems(brief, { baseDir: '/repo', fileExists: (path) => { opened.push(path); return true; } });
  assert.deepEqual(problems, []);
  assert.deepEqual(opened, ['/repo/docs/specs/a.md', '/abs/b.md']);
});

test('agent brief: flags a missing input, a missing Inputs section, an empty one and a missing stop rule', () => {
  const missing = findBriefProblems('## Inputs\n- docs/specs/gone.md\n\nThe agent stops and reports.\n', { baseDir: '/repo', fileExists: () => false });
  assert.equal(missing.length, 1);
  assert.match(missing[0], /docs\/specs\/gone\.md/);
  assert.match(findBriefProblems('Just build it. Stop and report if stuck.', { fileExists: () => true })[0], /No "## Inputs" section/);
  assert.match(findBriefProblems('## Inputs\n\n## Job\nStop and report.', { fileExists: () => true })[0], /is empty/);
  const noStop = findBriefProblems('## Inputs\n- none\n', { fileExists: () => false });
  assert.equal(noStop.length, 1);
  assert.match(noStop[0], /No stop rule/);
});
