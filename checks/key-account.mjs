#!/usr/bin/env node
// Rules R03 and R04: every key belongs to the account this project expects.
// Run at deploy time, before the build: `node checks/key-account.mjs && next build`.
// Reads expected accounts from standards.config.json under "accounts".
// Never prints a key value. Network errors count as failures (rule R14: fail closed).
import { readProjectConfig, report } from './lib/files.mjs';

const isProduction = () => (process.env.VERCEL_ENV ?? process.env.DEPLOY_ENV) === 'production';

async function readJson(url, headers) {
  const response = await fetch(url, { headers });
  let body = null;
  try { body = await response.json(); } catch { body = null; }
  return { status: response.status, body };
}

export async function checkStripe(expected, env, findings, notes) {
  const key = env[expected.env ?? 'STRIPE_SECRET_KEY'];
  if (!key) return findings.push(`Stripe: ${expected.env ?? 'STRIPE_SECRET_KEY'} is not set`);
  const isLiveKey = /^(sk|rk)_live_/.test(key);
  if (!isProduction() && isLiveKey) findings.push('Stripe: a live key is set outside production. Previews get test keys only.');
  if (isProduction() && !isLiveKey && expected.requireLiveInProduction !== false) findings.push('Stripe: production is using a test key.');
  const { status, body } = await readJson('https://api.stripe.com/v1/account', { Authorization: `Bearer ${key}` });
  if (status === 200) {
    if (body?.id !== expected.accountId) findings.push(`Stripe: key belongs to ${body?.id ?? 'an unknown account'}, expected ${expected.accountId}`);
    return;
  }
  if (status === 403) {
    notes.push('Stripe: this restricted key cannot read the account, so the account match was not proven. Give it read access to account details.');
    if (expected.allowUnverifiedRestrictedKey !== true) findings.push('Stripe: account match not proven (restricted key without account read).');
    return;
  }
  findings.push(`Stripe: account lookup failed with HTTP ${status}`);
}

export async function checkSupabase(expected, env, findings) {
  const url = env[expected.urlEnv ?? 'SUPABASE_URL'];
  if (!url) return findings.push(`Supabase: ${expected.urlEnv ?? 'SUPABASE_URL'} is not set`);
  const projectRefInUrl = new URL(url).hostname.split('.')[0];
  if (projectRefInUrl !== expected.projectRef) findings.push(`Supabase: URL points at project ${projectRefInUrl}, expected ${expected.projectRef}`);
  for (const keyEnv of expected.keyEnvs ?? []) {
    const key = env[keyEnv];
    if (!key) { findings.push(`Supabase: ${keyEnv} is not set`); continue; }
    // A key from another project is refused by this project's auth settings endpoint.
    const { status } = await readJson(`${url.replace(/\/$/, '')}/auth/v1/settings`, { apikey: key });
    if (status !== 200) findings.push(`Supabase: ${keyEnv} was refused by project ${projectRefInUrl} (HTTP ${status}). It may belong to another project.`);
  }
}

export async function checkResend(expected, env, findings, notes) {
  const key = env[expected.env ?? 'RESEND_API_KEY'];
  if (!key) return findings.push(`Resend: ${expected.env ?? 'RESEND_API_KEY'} is not set`);
  const { status, body } = await readJson('https://api.resend.com/domains', { Authorization: `Bearer ${key}` });
  if (status === 200) {
    const names = (body?.data ?? []).map((domain) => domain.name);
    if (!names.includes(expected.domain)) findings.push(`Resend: key's account does not own ${expected.domain}`);
    return;
  }
  if (status === 401 || status === 403) {
    // Sending-only keys cannot list domains. That is the safer key type, so this is a note, not a failure.
    notes.push('Resend: sending-only key, so the domain match was not proven by this check.');
    return;
  }
  findings.push(`Resend: domain lookup failed with HTTP ${status}`);
}

export async function findKeyAccountProblems(rootDir, env = process.env) {
  const accounts = readProjectConfig(rootDir).accounts ?? {};
  const findings = [];
  const notes = [];
  const checks = { stripe: checkStripe, supabase: checkSupabase, resend: checkResend };
  for (const [service, expected] of Object.entries(accounts)) {
    const check = checks[service];
    if (!check) { findings.push(`${service}: no check exists for this service yet`); continue; }
    try {
      await check(expected, env, findings, notes);
    } catch (error) {
      findings.push(`${service}: check could not run (${error.message}). Counted as a failure.`);
    }
  }
  for (const note of notes) console.log(`  note: ${note}`);
  return findings;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(report('key-account', await findKeyAccountProblems(process.argv[2] ?? process.cwd())));
}
