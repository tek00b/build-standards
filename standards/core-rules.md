# Core rules

The short list every project follows. Judgment guidance lives in standards/judgment/ (coming next). How each check works lives in rules/machine-rules.md. Decisions behind rules live in standards/decisions.md.

**Tags.** `code`: the source project backed it with code, a command or a check result. `doc`: a project doc or handoff says so, not re-checked. `guess`: someone's read, not yet tested. `decision`: the owner's call (see decisions.md). `requirement`: the owner asked for it; no project evidence yet. Nothing here has been re-run by this project yet. The first thin slice (the first pilot app) re-tests them and upgrades or drops tags.

**Sources.** Evidence comes from internal project handoffs dated 2026-11-15, kept private. "Project" in the Source column means one of those handoffs.

**Check.** The CI check or step that enforces the rule. "Review" means only the reviewer enforces it today, which makes it a candidate for a new check.

## How we work

| ID | Rule | Why | Source | Date | Tag | Check |
|---|---|---|---|---|---|---|
| R01 | One home for everything. Rules, lists, facts, helpers and code blocks live in one place; everything else links to it. A second copy is debt, a third is a must-fix. | Project  copied sameOrigin five times after the rule was written. The AI-mistakes list existed in two skills. | ProjectD12 | 2026-11-15 | code | doc-duplicates, jscpd |
| R05 | Never trust a tool's "done." Read back from a second source: a SELECT after a write, a live fetch after a deploy, a file read after a save. | Supabase writes reported "cancelled" after they ran. A Vercel redeploy "should be fine" had failed. | Project | 2026-11-15 | doc | Review |
| R06 | Source and build scripts are saved durably (Git) before a session ends, and the project rebuilds with one command. | Project  lost a day of work in a temp workspace. A project's PDF build script was never saved. | Project | 2026-11-15 | doc | CI build from a clean checkout |
| R07 | A rule written only in prose gets a check in CI, or a dated plan to add one. | A project's save-source rule broke twice while it lived only in a skill. | Project | 2026-11-15 | doc | This file's Check column |
| R08 | Each project keeps a retired-terms list that CI greps. | Banned phrases and corrected names were swept by hand. | Project | 2026-11-15 | doc | retired-terms |
| R09 | Docs match what is live. Each release compares docs to the live system and fixes drift. | A project's decisions doc named an old deploy as live. A project's README described one function when there were 60. | Project | 2026-11-15 | code | Review (docs-vs-live check planned) |
| R10 | Read the code and project files before writing scope or saying something is missing. | A project's scope doc called a built feature unbuilt. A scheduled run said files were missing when they were not. | Project | 2026-11-15 | doc | Review |
| R11 | Skills hold rules. Facts that change live in the project or are read live from the source. | A project skill's build command went stale inside the skill. | ProjectD13 | 2026-11-15 | decision | Review |
| R12 | Helpers are read-only and save nothing; the main session writes, and saves after every chunk. Key docs go to subagents inline. | A helper lost a book's notes. A subagent reviewer could not open the project docs. | Project | 2026-11-15 | doc | Review |
| R13 | Every release records its live and rollback deploy IDs and ends with a Builder's Brief (what changed, data touched, risk accepted, one concept). | Rollback IDs made a project's releases recoverable. | Project | 2026-11-15 | doc | Review |

## Shipping and review

| ID | Rule | Why | Source | Date | Tag | Check |
|---|---|---|---|---|---|---|
| R15 | Machines run first: format, lint, type check, tests, build, secret scan, security scan, dependency audit, duplicates, retired terms. A failing machine check stops the release. | A project's npm audit was red on main for a day and nobody noticed. | Project | 2026-11-15 | code | standards.yml |
| R16 | Reviewed code ships without asking. Money changes wait for the owner's yes, in one batched list. | See D02, D03. | D02, D03 | 2026-11-15 | decision | CI label "needs the owner" (planned) |
| R17 | The reviewer is a fresh agent that gets the spec, the diff and the standards inline, never the coder's reasoning. It fixes and logs every fix; a fresh agent re-checks the fix. Money, security and migrations add an attacker reviewer. | A fresh reviewer caught an answer showing on a button. A checker given claims only downgraded 3 of 7. | ProjectD04 , D05 | 2026-11-15 | doc | Required review check (planned) |
| R18 | A reviewer checks edits against the real file, never the plan. | A planned fix changed one word and left the surrounding logic wrong. | Project | 2026-11-15 | doc | Review |
| R19 | Check what users see before accepting a library default. | Google sign-in showed "continue to ...supabase.co" at the first step. | Project | 2026-11-15 | doc | Review |

## Security

| ID | Rule | Why | Source | Date | Tag | Check |
|---|---|---|---|---|---|---|
| R02 | Secret values live only in the host's secret store. Never in code, committed files, docs, chat or skills. A person pastes them; Claude never reads them. .env.example lists names only. | Settles one project's conflicting docs. | D09, Project | 2026-11-15 | decision | gitleaks, env-example |
| R03 | Before any write to keys, billing or deploys, name the account and project. At deploy, each key must prove it belongs to the expected account. | Keys for one project were pasted into another project and broke its payments. | ProjectD10 | 2026-11-15 | doc | key-account |
| R04 | One narrow key per project and purpose. Previews never hold live keys. | A project's restricted Stripe key and single-purpose Resend key limit damage. Preview deployments held production write tokens. | Project | 2026-11-15 | doc | key-account (live key outside production) |
| R14 | Security tests fail closed: a network error or surprise is a failure. Test every lock as a stranger and as a second user. | A security test passed when the network errored. | Project | 2026-11-15 | doc | Review (lock-test helper planned) |
| R20 | The server checks every request: auth, ownership of the object, Origin on writes, body size, and a rate limit on every endpoint. Every loop, queue, batch and retry has a fixed upper bound. Money and paid access are computed and enforced on the server; a feature switch closes every side door. | A paid-plan switch once left a billing side door open. Missing limits and object access were the top flaws in an outside scan. | Project | 2026-11-15 | doc | Review, semgrep |
| R21 | Anything that costs money has a meter, a ceiling and a kill switch that works without a deploy. | AI and email calls can run up cost. | Project | 2026-11-15 | doc | Review |
| R22 | Dependencies: exact versions, a committed lockfile, `npm ci`. Confirm a new package exists and is the real one. Patch framework security releases the same day. | A framework version with critical advisories stayed live. AI tools invent package names. | Project | 2026-11-15 | doc | npm audit (pin check planned) |

## Data

| ID | Rule | Why | Source | Date | Tag | Check |
|---|---|---|---|---|---|---|
| R23 | Default data layer: RLS on every table; access through guarded functions; security definer functions set an empty search_path, check the caller first, and revoke from public and anon. | Used in three projects (one had 210 empty search_path settings across 31 files), and two other projects. | Project | 2026-11-15 | code | Supabase advisors (weekly run planned) |
| R24 | Webhooks verify the signature on the raw bytes and record the event ID first, so each event applies once. | Bad signature broke every event until fixed. Two projects keep idempotency tables. | Project | 2026-11-15 | code | Review |
| R25 | Never edit an applied migration. Migrations are safe to run twice and end with a check that raises when the result is wrong. | Project  edited applied migrations to keep a game list in sync. | Project | 2026-11-15 | code | Review (migration-hash check planned) |
| R26 | A list that grows with every feature lives in a table, never in text each migration rewrites. Business rules live in the database. | Five migrations in one project patched live function text. | Project | 2026-11-15 | code | Review |
| R27 | Data is designed with social-network thinking: every action writes its state row and an append-only event (IDs only) together, places and times get stable IDs, shared experiences form a graph, every personal field records consent, and notifications pass one gatekeeper. | the owner's build rule for every project; shape set by D17 to D19. | the owner | 2026-11-15 | requirement | Review (judgment/data-design.md next) |
| R28 | Demo and seed data carry a removable tag and a one-step delete. | Project  showed a full crowd without polluting real data. | Project | 2026-11-15 | doc | Review |
| R29 | Before launch: a privacy page that matches what the code does, an unsubscribe link, and a way to delete a person's data. | Projects launched without one or both, or with a privacy page that named a tool not in use. | Project | 2026-11-15 | doc | Review (gap; judgment/privacy-and-consent.md next) |

## Interface and writing

| ID | Rule | Why | Source | Date | Tag | Check |
|---|---|---|---|---|---|---|
| R30 | Buttons get a 1 to 3 word label and an icon. Longer text goes in a visible tip that opens on hover, tap and keyboard focus. Nothing a person taps moves the page. Test the longest label at 320 and 390 px. Clean, Apple-style visuals. | "Back to the hand" pushed a page to 425 px at 390. | the owner, Project | 2026-11-15 | requirement | Review, axe (label-length lint planned) |
| R31 | No em dashes and no "it's not X, it's Y" in anything people read. | the owner's writing rule in every project. | the owner | 2026-11-15 | requirement | writing-style |
| R32 | Accessibility: axe WCAG 2.2 AA with zero violations at desktop and phone widths. | Project  found 1.9:1 contrast and hidden form labels this way. | Project | 2026-11-15 | code | Review (axe step planned) |

## Code habits (added from the research pass)

| ID | Rule | Why | Source | Date | Tag | Check |
|---|---|---|---|---|---|---|
| R36 | Names: units and qualifiers last (`timeout_ms_max`), no abbreviations, booleans named positively (`has_enemies`, never `no_enemies`). | Names that line up and read plainly; negated booleans breed double negatives. | TigerStyle, Evan Todd, D14 | 2026-11-15 | decision | Review (lint planned) |
| R37 | Check assumptions in code with assertions. A broken assumption is a programmer error: fail loudly in development and report it in production. User input and network failures are expected: handle them. | Defensive null checks hide real bugs, a known AI habit. | TigerStyle, NASA Power of Ten, Evan Todd, D14 | 2026-11-15 | decision | Review |
| R38 | Write the calling code first for any new helper, endpoint or API, then build to it. | APIs shaped by their first real use come out simpler. | Muratori, Evan Todd, D14 | 2026-11-15 | decision | Review |
| R39 | Every spec names a performance budget (page weight, network round trips, time until the page responds), and the release checks it. | Performance is a design input, the main lesson from game programmers. | Acton, Muratori, D16 | 2026-11-15 | decision | Release checklist (budget check planned) |

## Testing

| ID | Rule | Why | Source | Date | Tag | Check |
|---|---|---|---|---|---|---|
| R33 | Bug fixes and core logic (money, grading, permissions, data rules) start with a failing test. Elsewhere, tests land with each small slice, before review. Tests check behavior, never the mock. | A failing test written first is the best guard against AI tests that only check the mock. Test-first everywhere is contested (Ousterhout vs Martin debate). | ProjectD15 | 2026-11-15 | decision | Review |
| R34 | Anything graded or calculated gets an independent answer key that shares no code with the generator. Every number shown is tested. | About 7% of generated answers were wrong before an independent answer key caught them. | Project | 2026-11-15 | code | Review |
| R35 | Money flows get one real end-to-end test with a small live payment before launch. | Small live test payments caught what tests missed. | Project | 2026-11-15 | doc | Release checklist |
