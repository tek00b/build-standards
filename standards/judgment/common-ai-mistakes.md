# Common AI coding mistakes

The one list (D12). The coder avoids these; the reviewer hunts them, in this order, on every change and on the code around it. Grow it from real findings: every review miss logged in measure/review-misses.md that fits a pattern lands here.

Merged on 2026-11-15 from the coder and code-reviewer skills, which each held a copy.

| # | Mistake | Do instead (coder) | Hunt (reviewer) |
|---|---|---|---|
| 1 | Logic that looks right but breaks a rule only this project has | Read the spec and the project rules; test each rule | Run every project rule through the code |
| 2 | Missing error paths: no null checks or early returns, failures that return success | Write the failure test first | Find each failure path and its test |
| 3 | Auth checked only in the browser; user A can reach user B's object | The server checks auth and ownership on every request | Check every endpoint, not only the changed ones. Object-access flaws grew from 11% to 28% of findings as one app grew |
| 4 | No rate, size or query limits | Every endpoint, upload and query gets a limit by default | Look for unbounded loops, queries and uploads |
| 5 | Hardcoded or default secrets, keys in front-end code, debug mode on | Secrets only in the host's secret store (R02) | Secret scan before and after; grep for debug flags |
| 6 | Passwords or tokens handled ad hoc | Use the approved helper only | Any crypto or credential code outside the helper |
| 7 | Unvalidated input, `eval` or shell on user input, open uploads | Validate at the edge; never run user input | Trace every input to where it is used |
| 8 | Invented, outdated or look-alike packages | Confirm the package exists, is the real one and is needed | Check every new dependency |
| 9 | Code that works but breaks the local pattern: names, layout, terms | Read the neighboring code and match it | Compare with the neighbors. Readability was the largest gap in the evidence |
| 10 | A new helper that duplicates one that exists | Search first (R01) | jscpd output; search for similar names |
| 11 | Giant files and functions; vague names | Small modules; names say what and why | Files over about 400 lines, functions over about 60 |
| 12 | Hardcoded values that belong in config | Move them to config | Literals for URLs, prices, limits, dates |
| 13 | Excess reads and writes, one call per item | Batch; pick the right structure | Calls inside loops |
| 14 | Wrong order, shared state, misused concurrency | Name what must happen first | Races, missing locks, missing transactions |
| 15 | Invented APIs or options | Check the docs or run it | Calls that do not exist in the installed version |
| 16 | Test and production data shared; internal tools public | Keep them apart, behind login | Environment config and preview keys (R04) |
| 17 | No access log for personal or regulated data | Log access from day one; ask what the sector adds | Personal-data reads without a log |
| 18 | Tests that check the mock instead of the behavior | Test what the user sees or the data that lands | Tests that pass with the code deleted |
| 19 | Docs and comments that describe the old behavior | Update them in the same change | Diff the docs against the change |
| 20 | Saying it works without running it | Run it and show the output (R05) | Ask for the receipt |
| 21 | Security getting worse across repeated edits | Rerun the security scan after every round, not only at the end | On a later round, compare scans before and after and re-read earlier fixes |
| 22 | Detecting a state from a stand-in number that other things also move (run speed for a buff, a timer for a phase, a price for a plan) | Read the state itself: the buff and its stack count, the event the platform fires, the record that holds it. Use a stand-in only when nothing direct exists, and say so in a comment | For each trigger, ask what else changes the number it reads; one other cause is a bug |

## Evidence notes

- #22 comes from a real miss (Parsley, WoW: Forever add-on, Nov 26, 2026): a Tauren "choo-choo" meant to fire at full Plainsrunning speed read run speed instead. Full Plainsrunning (+30%) never reached the speed line, and potions, a hunter's Aspect of the Pack and mounts crossed it without Plainsrunning. Fixed in 0.0.32 by reading the buff's stack count. Spotted by the product owner, not by review. Tag: `obs`, one case.

Most are vendor reports with small samples; the two papers are peer-reviewed. Use them to decide where to look, not as proof. Tags: `doc` (reported, not re-checked).

- CodeRabbit compared 470 open-source pull requests, 320 with AI co-authorship and 150 human only. AI pull requests averaged 10.83 issues against 6.45. Logic errors were about 75% more common, readability over 3 times, error handling nearly 2 times, security up to 2.74 times, excess I/O about 8 times. AI authorship was inferred from signals, and the company sells a review product.
- Xint.io scanned three apps for 30 minutes each and found 434 exploitable flaws. Most common: missing limits and denial of service (93), authorization and object access (88), boundary or path flaws (54). Hardcoded or default secrets and debug-mode code execution were most of the 23 critical findings.
- The repeated-edits finding (#21) comes from Shukla, Joshi and Syed (IEEE ISTAS 2025, arxiv.org/abs/2506.11022): 400 code samples over 40 rounds of AI "improvements" showed 37.6% more critical vulnerabilities after five rounds. Peer-reviewed; read at the abstract. Kaspersky also cites Veracode (about 45% of generated code had OWASP Top 10 weaknesses), not opened at the source.
- Perry, Srivastava, Kumar and Boneh (CCS 2023, arxiv.org/abs/2211.03622): people using an AI assistant wrote insecure code more often on four of five tasks and were more likely to believe it was secure. Giving the assistant function declarations and clear instructions produced more secure code, which backs R38 and a spec that names the functions. Tag: `doc`, peer-reviewed user study.
- Sources: securityweek.com/vibe-coded-apps-riddled-with-exploitable-security-flaws, coderabbit.ai/blog/state-of-AI-vs-human-code-generation-report, kaspersky.com/blog/vibe-coding-2025-risks. None measures same-model review directly.
