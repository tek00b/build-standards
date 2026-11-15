#!/usr/bin/env node
// Runs the offline checks in one go: retired terms, env example, doc duplicates.
// key-account needs live keys, so it runs at deploy time instead (see README).
import { findRetiredTerms } from './retired-terms.mjs';
import { findEnvExampleProblems } from './env-example.mjs';
import { findDocDuplicates } from './doc-duplicates.mjs';
import { findWritingStyleProblems } from './writing-style.mjs';
import { report } from './lib/files.mjs';

const rootDir = process.argv[2] ?? process.cwd();
const results = [
  report('retired-terms', findRetiredTerms(rootDir)),
  report('env-example', findEnvExampleProblems(rootDir)),
  report('doc-duplicates', findDocDuplicates(rootDir)),
  report('writing-style', findWritingStyleProblems(rootDir)),
];
process.exit(results.some((code) => code !== 0) ? 1 : 0);
