# Decisions

the owner's calls on the Build Standards project. A decision is only a decision when the owner makes it. Newest first. Each line: date, decision, reason.

## 2026-11-23

| # | Decision | Why |
|---|---|---|
| D20 | No agent starts without the brief preflight: inputs listed as file paths, each one checked, and the stop rule in the brief (`checks/agent-brief.mjs`, `templates/agent-brief.md`). Build specs are committed to `docs/specs/` when a build starts. Applies in every project. (R12) | R12 already said key docs go to subagents inline, but it lived only in prose and was skipped: a builder stopped mid-run and the restart cost credits. R07 says a prose rule gets a check. |

## 2026-11-15

| # | Decision | Why |
|---|---|---|
| D01 | Judgment rules live in a shared build-studio skill. Machine-checkable rules live in this repo as CI checks every project calls. | A rule in prose gets skipped; a check in CI runs on every push. A project's save-source rule broke twice for that reason. |
| D02 | Reviewed code ships without asking. Any change with financial implications needs the owner's direct yes, even after review. | Code review has worked; the expensive misses were money and accounts (keys pasted into the wrong project, a mis-pasted webhook secret, a billing side door). |
| D03 | Money approvals come as one batched list per session. Each item names the exact step, the account and the amount at stake. | Matches how one project's pipeline already batches approvals. |
| D04 | The reviewer fixes what it finds and logs every fix as a finding. A fresh agent re-checks only the fix. | the owner: the stronger model should fix. The log keeps what the coder missed visible for measurement. |
| D05 | The second reviewer on money, security and migrations plays attacker, with the endpoint and lock table. | Project : two reviewers on one model with different inputs caught different flaws. |
| D06 | the owner's review is a plain-language brief plus one live test. A senior engineer (an outside senior engineer) reviews now and then to calibrate the reviewer. | Small live test payments worked. |
| D07 | The review is a required CI check. | Project  planned a review that was never logged as done. |
| D08 | The Fable review runs once per release, not every commit. | Keeps usage within plan limits. |
| D09 | Secret values live only in the host's secret store (Vercel environment variables marked Sensitive, Supabase secrets). Never in code, committed files, docs, chat or skills. A person pastes them; Claude never reads them. | Settles the conflict between a project's docs; fits every project. |
| D10 | Projects keep sharing the Vercel team for now. Every project gets its own narrow keys and a deploy-time check that each key belongs to the expected account. A project gets its own team once it has steady revenue or a second person with access. | The deploy check catches that incident class for free; a team is about $20 a month. |
| D11 | Project  moves to GitHub before it adopts the shared standards. | Without Git, CI cannot run and nothing proves review. |
| D12 | One home for everything. No duplicate rules, lists, facts or code; everywhere else links. | the owner: stop duplicating work. A project had sameOrigin five times; the AI-mistakes list existed twice. |
| D13 | Skills hold rules. Projects hold facts that change (IDs, build commands, what is live), or read them live from the source. | A project skill's build command went stale inside the skill. |
| D14 | Add four code habits from the research pass: units-last naming, assertions for programmer errors, limits on every loop and queue, calling code first. (R36 to R38, R20) | Agreement across TigerStyle, Carmack, Muratori, Ousterhout and Evan Todd; see library/who-to-learn-from.md. |
| D15 | Tests first for bug fixes and core logic; elsewhere tests land with each small slice before review. (R33) | Keeps the guard against mock-only AI tests without forcing test-first where it is contested. |
| D16 | Every spec names a performance budget and the release checks it. (R39) | The game programmers' main lesson, adapted for web. |
| D17 | Events are an append-only history written in the same transaction as the normal state rows. Screens read the state rows; a scheduled check compares counts with events. No full event sourcing. | Teams that built whole systems on event sourcing reported lagging reads, stale events and heavy plumbing (library/social-data-research.md section 1). |
| D18 | Events carry IDs and codes only. Names, emails, phone numbers and anything a person wrote live in normal rows the erase function can blank. | Makes deleting a person simple without per-person encryption keys (section 5). |
| D19 | Every notification goes through one gatekeeper function that checks consent, the weekly cap, duplicates and whether the item is still open, at queue time and at send time. | LinkedIn's Air Traffic Controller; more pushes meant more uninstalls in a 17,500-user experiment (section 4). |
