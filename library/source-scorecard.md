# Source scorecard

How we decide who and what counts as best in class: people, repos, books, talks and papers. A source earns a place in the library on evidence, not fame or GitHub stars.

## Six criteria, 0 to 3 each (max 18)

| # | Criterion | 0 | 1 | 2 | 3 |
|---|---|---|---|---|---|
| 1 | **Independent praise** from experienced engineers | None found | One source | Two or three independent sources | Four or more, across communities (HN, Reddit, talks, books) |
| 2 | **Shipped at scale** | Hobby only | Small product | Widely used product or game | Industry standard, years in production |
| 3 | **Shows its evidence** (code, measurements, postmortems) | Claims only | Examples | Real code or data | Open code plus measurements |
| 4 | **Holds up over time** | Under 1 year | 1 to 3 years | 3 to 10 years | 10+ years and still cited |
| 5 | **Fits our work** (JS and Node, Postgres, web, games and trainers, AI agents) | No | Distant | Partly | Directly |
| 6 | **Disagreement handled** (states limits, engages critics) | Dogmatic | Rarely | Sometimes | Names tradeoffs and answers critics |

**Tiers:** 15 to 18 core (read in full, rules may cite it); 11 to 14 strong (read the relevant parts); 7 to 10 useful for one topic; below 7 left out.

**Rules:** score from what was actually read, and say how (`read in full`, `read in part`, `summary only`). A summary-only source cannot reach core. Rescore at the monthly review when new evidence arrives.

## Current scores (2026-11-15, first pass)

| Source | Praise | Scale | Evidence | Time | Fit | Tradeoffs | Total | Tier | Read how |
|---|---|---|---|---|---|---|---|---|---|
| TigerStyle / TigerBeetle | 2 | 2 | 3 | 1 | 2 | 2 | 12 | Strong | Read in full |
| Ousterhout, A Philosophy of Software Design + debate | 3 | 2 | 3 | 2 | 3 | 3 | 16 | Core | Debate in full; book not yet |
| Acton, Data-Oriented Design talk | 3 | 3 | 2 | 3 | 2 | 1 | 14 | Strong | Summaries and slides |
| Muratori, Semantic Compression + Clean Code video | 3 | 3 | 3 | 3 | 2 | 1 | 15 | Core (pending full read) | Summaries and excerpts |
| Carmack, inlining email + functional C++ | 3 | 3 | 2 | 3 | 2 | 2 | 15 | Core (pending full read) | Excerpts |
| Nystrom, Game Programming Patterns | 3 | 2 | 3 | 3 | 3 | 3 | 17 | Core | Contents only so far |
| Google eng-practices (review) | 2 | 3 | 2 | 2 | 3 | 2 | 14 | Strong | Read in part |
| SQLite (testing) | 3 | 3 | 3 | 3 | 2 | 2 | 16 | Core | Test guide read in full |
| Postgres source | 3 | 3 | 3 | 3 | 3 | 1 | 16 | Core | Not yet read |
| Doom 3 BFG source | 3 | 3 | 3 | 3 | 1 | 1 | 14 | Strong | One file read |
| ripgrep | 3 | 3 | 3 | 2 | 1 | 2 | 14 | Strong | Not yet read |
| Mastodon follow and notify | 1 | 3 | 3 | 3 | 3 | 1 | 14 | Strong | Two files read in full |
| atproto lexicons | 1 | 3 | 3 | 1 | 3 | 2 | 13 | Strong | Read in part |
| stb, Dear ImGui, raylib | 3 | 3 | 3 | 3 | 1 | 1 | 14 | Strong | Read in part |
| Evan Todd, Thirteen Years of Bad Game Code | 2 | 1 | 3 | 2 | 2 | 3 | 13 | Strong | Slides and excerpts |
| Robert Martin, Clean Code (counterpoint) | 3 | 2 | 1 | 3 | 2 | 2 | 13 | Strong, read as counterpoint | Debate in full |

These first scores carry `opinion`. Each one firms up when the source is read in full.
