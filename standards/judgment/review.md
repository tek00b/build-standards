# Agents and review

Who does what, how work passes between agents, and how review works. Decisions D02 to D08 and rules R12, R16 to R18 are the floor.

## Roles

Knowledge lives in skills and this repo. Agents are limited to three independent roles; machines carry most of the load and run first.

| Role | Model | Gets | Never gets | Writes |
|---|---|---|---|---|
| Builder | Opus | Spec, standards, the code | n/a | Code on a branch, tests, the Builder's Brief |
| Reviewer | Fable, fresh agent | Spec, diff, standards inline, exemplar notes | The builder's reasoning or chat | Findings, then fixes, each logged as a finding |
| Attacker (money, security, migrations) | Opus, fresh agent | Spec, diff, attack-surface.md, security.md | Both reasoning trails | Findings only |
| Fix checker | Fresh agent | The reviewer's fix diff and findings | Earlier reasoning | Pass or findings |
| Researcher | Fable | The question and sources | n/a | Notes in our own words, each item tagged fact or opinion |
| the owner | n/a | A plain-language brief, one live test, the batched money list | n/a | Yes or no |

A human senior engineer (an outside senior engineer) reviews a change now and then. Their findings become the answer key in measure/review-misses.md.

## Flow for one release

1. Builder works on a branch. CI must be green before review starts.
2. Reviewer reads every changed file end to end, plus what it calls, and checks edits against the real files (R18). It hunts common-ai-mistakes.md in order and scores the rubric below.
3. Reviewer logs each finding (severity, file:line, one-line senior comment, the fix), then fixes it.
4. Fix checker reviews only the fix diff. CI runs again.
5. For money, security or migrations, the attacker runs in parallel with the reviewer.
6. Changes with financial implications wait for the owner's batched yes. Everything else merges.
7. Builder writes the Builder's Brief and records live and rollback deploy IDs.

## Rubric (1 to 5 each, with file:line evidence)

- Correctness (follows the spec and the project's own rules)
- Security (inputs trusted only after checks, auth before data, no secrets, least privilege)
- Structure and boundaries (thin edges, shared cores, no logic in the wrong layer)
- Naming (says what and why; same word for the same thing everywhere)
- Consistency (one way to do a thing)
- Modern style (current language features and platform APIs, no dead patterns)
- Tests (beside the work, test behavior not mocks, a test for every bug fixed)
- Readability (file and function size, comments explain why)
- Duplication
- Performance and memory
- Data design (keys, constraints, indexes, events, consent; migrations never edited after applying)
- Interface (labels, tips, layout at 390 and 1280 px)

For each finding, name the pattern and the rule or exemplar behind it. Confirm every new dependency exists, is the real package and is needed.

Verdict: PASS, PASS WITH FIXES (fixes made and checked), or BLOCK. BLOCK on any Critical or High security finding, a failing machine check, or a Must that cannot be fixed in this release.

## Handoffs

- Pass key docs inline. A subagent that could not open the project docs reviewed without the research (a project review).
- Helpers do not write files; the main session saves after every chunk (R12).
- Every log line records the model that actually ran .
- One coordination file per project names lanes, write rules, the approval list and the model table. Nothing else restates them.

## What was overkill (from the handoffs, `guess`)

- Detailed specs for pipelines that were never built.
- A high-volume content agent running before the product had users.
- A "debate" run inside one agent instead of two independent ones.
- A large naming run before asking what the owner wanted.
