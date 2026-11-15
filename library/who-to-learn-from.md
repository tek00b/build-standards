# Who to learn from: clean code, and how game programmers do it differently

Research pass, 2026-11-15. Sources: Hacker News and Reddit threads, developer blogs and podcasts, the primary documents and repos named below (cloned and read where marked). Every item is tagged:

- `fact`: sourced. Says what someone wrote, measured or did, with a link.
- `opinion`: someone's view, even a famous one. Useful, not settled.
- `ours`: what this means for our standards, my read until the owner decides.

Not done yet: YouTube transcripts read in full, and the paid books. The slice research is in social-data-research.md. See "Still to do" at the end.

## The short answer

The best engineers disagree on style, but they agree on more than the arguments suggest:

1. **Understand the data before you write the code.** (Acton, Muratori, Kleppmann, our data-design.md)
2. **Put a limit on everything and check your assumptions in code.** (TigerBeetle, NASA Power of Ten, our R20 and R21)
3. **Fewer, deeper pieces beat many tiny ones.** (Ousterhout, Carmack, Muratori; Robert Martin is the main dissent)
4. **Keep state small and explicit; derive the rest.** (Carmack, Evan Todd, Nystrom)
5. **Few or zero dependencies.** (stb, Dear ImGui, TigerBeetle)
6. **Comments say why.** (Ousterhout, Doom 3, Evan Todd; Martin wants far fewer)
7. **Stars do not measure quality.** The most-starred repos on GitHub are lists and AI tools, not exemplary code.

## How game programmers differ

Game code runs a loop 60 or more times a second with a fixed budget per frame. That pressure produced a distinct school of thought. What transfers to web apps is the discipline, not the C++.

### 1. Data first
- `fact` Mike Acton (Engine Director, Insomniac Games) gave the CppCon 2014 keynote "Data-Oriented Design and C++." Its core claims: a program's purpose is to transform data, and if you have different data you have a different problem. ([isocpp.org](https://isocpp.org/blog/2015/01/cppcon-2014-data-oriented-design-and-c-mike-acton), [slides](https://www.slideshare.net/cellperformance/data-oriented-design-and-c))
- `opinion` It is still cited as one of the best C++ talks of the decade (ACCU Overload, 2022; r/cpp, 2025).
- `ours` Matches data-design.md: design tables from the events and queries you will actually run, not from an object diagram.

### 2. Performance is a design input
- `fact` Casey Muratori (Bink, Granny, Handmade Hero) published "Clean Code, Horrible Performance" (Feb 2023). On a shape-area example, replacing polymorphism with a switch measured about 1.5x faster, a lookup table about 10x, and up to about 15x with a second property. ([computerenhance.com](https://www.computerenhance.com/p/clean-code-horrible-performance), numbers via [The New Stack](https://thenewstack.io/when-clean-code-hampers-application-performance/))
- `opinion` Critics answer that the example is narrow and that 1.5x rarely justifies extra maintenance; Robert Martin replied publicly. The debate continued on SE Radio 577.
- `ours` For our web apps the big wins are fewer network round trips and smaller pages, not virtual calls. The lasting lesson: state a performance budget in the spec and measure against it (operations.md).

### 3. Fewer, deeper functions; inline code used once
- `fact` John Carmack's 2007 email to id Software argued for inlining functions called from only one place, so the whole flow reads top to bottom. His 2014 preface says pure functional style addresses the real enemy more directly: unexpected dependencies and mutated state. ([Jonathan Blow's archive](http://number-none.com/blow/blog/programming/2014/09/26/carmack-on-inlined-code.html))
- `fact` Carmack also wrote "Functional Programming in C++" for #AltDevBlogADay. ([Game Developer](https://www.gamedeveloper.com/programming/in-depth-functional-programming-in-c-))
- `fact` John Ousterhout and Robert Martin debated this in writing (Sept 2024 to Feb 2025). They agreed modular design is good and that over-decomposition is possible; they disagreed on how far to split. Ousterhout measured Martin's rewrite of his own PrimeGenerator at 3 to 4x slower. Read in full from the repo. ([johnousterhout/aposd-vs-clean-code](https://github.com/johnousterhout/aposd-vs-clean-code))
- `ours` Our "about 60 lines gets a look" is a prompt to look, not a rule to split. Split when a piece hides real complexity behind a simple interface (Ousterhout's "deep module"), not to hit a line count.

### 4. Write the usage code first, then compress
- `fact` Muratori's "Semantic Compression": write the plain working code first, then pull out the repeated parts once you see them, so abstractions come from real duplication. For new APIs he says to write the calling code first. ([caseymuratori.com](https://caseymuratori.com/blog_0015), [Handmade forum discussion](https://hero.handmade.network/forums/code-discussion/t/3254/p/15782))
- `ours` Fits R01 (a second copy is debt, a third is a must-fix) and adds a habit: write the code that calls a new helper or endpoint before writing the helper.

### 5. Put a limit on everything; assert what you assume
- `fact` TigerBeetle's TIGER_STYLE.md (read in full from the repo) sets safety, then performance, then developer experience. Every loop and queue gets a fixed upper bound. Functions average at least two assertions, and important facts are checked on two paths (before writing to disk and after reading back). Hard limits: 70 lines per function and 100 columns per line. Zero dependencies beyond the Zig toolchain. It builds on NASA's "Power of Ten" rules. ([TIGER_STYLE.md](https://github.com/tigerbeetle/tigerbeetle/blob/main/docs/TIGER_STYLE.md), [Power of Ten PDF](https://spinroot.com/gerard/pdf/P10.pdf))
- `fact` The same guide says to put units last in names (`latency_ms_max`, not `max_latency_ms`), never abbreviate, and get the nouns and verbs right.
- `opinion` Some on Hacker News call it old practice with new branding; others say it changed how they code.
- `ours` Supports R20 and R21. Adds two things: assert assumptions in code (programmer errors fail loudly; user and network errors are handled), and the naming rule on units.

### 6. Do not over-handle errors you cannot recover from
- `fact` Evan Todd's "Thirteen Years of Bad Game Code" catalogs his own mistakes: null checks that hid real bugs, redundant state variables, boolean parameters, singletons. His fixes: derive state from the fewest variables, initialize everything explicitly, name booleans positively, write the client code first, and let truly unrecoverable errors crash. ([etodd.github.io/bad-code](https://etodd.github.io/bad-code), [Game Developer](https://gamedeveloper.com/programming/thirteen-years-of-bad-game-code))
- `ours` Matches common-ai-mistakes #2 from the other side: AI adds defensive checks that hide bugs. A failed assumption should fail loudly in development and be reported in production.

### 7. Few dependencies, drop-in libraries
- `fact` Sean Barrett's stb libraries are single-file and public domain. His how-to (read from the repo) puts "avoid dependencies" second on its list. ([stb_howto.txt](https://github.com/nothings/stb/blob/master/docs/stb_howto.txt))
- `fact` Dear ImGui (Omar Cornut), first built for Media Molecule's Tearaway, keeps its core in a few platform-free files. Its main header is organized in labeled sections with an index at the top (read from the repo). ([imgui.h](https://github.com/ocornut/imgui/blob/master/imgui.h))
- `fact` raylib exposes its whole API as about 600 flat, plainly named functions in one header, each with a one-line comment (`InitWindow`, `BeginDrawing`, `DrawText`). Counted from the repo. ([raylib.h](https://github.com/raysan5/raylib/blob/master/src/raylib.h))
- `ours` Supports R22. One of our projects already runs its API with zero runtime dependencies.

### 8. Group lifetimes instead of tracking each object
- `fact` Ryan Fleury (Epic Games, RAD Debugger) popularized arena allocators for C: free a group of things together at the end of a frame or request. ([Untangling Lifetimes](https://www.rfleury.com/p/untangling-lifetimes-the-arena-allocator))
- `ours` JavaScript manages memory for us. The idea that transfers is request-scoped state: everything a request creates dies with it, with nothing left in module-level variables.

### 9. Patterns, adapted for games
- `fact` Robert Nystrom's Game Programming Patterns is free online and covers the game loop, update method, component, event queue, object pool, dirty flag and data locality. He wrote it while working at EA. ([gameprogrammingpatterns.com](https://gameprogrammingpatterns.com/contents.html))
- `ours` The game designer skill should read the game loop, state and event queue chapters before any trainer build.

## People

| Person | Known for | What to take | Tag |
|---|---|---|---|
| John Carmack | Doom, Quake, id Tech | Inline code used once; functional style; limit mutable state | fact (essays) |
| Casey Muratori | Bink, Handmade Hero, Computer Enhance | Usage code first; compress real duplication; performance as design input | fact, opinion |
| Mike Acton | Insomniac engine director | Understand the data; different data, different problem | fact (talk) |
| Robert Nystrom | Game Programming Patterns, Crafting Interpreters | Patterns adapted for games; teaching-quality code | fact (free books) |
| John Ousterhout | A Philosophy of Software Design | Deep modules; comments carry design; against over-splitting | fact (book, debate) |
| Robert C. Martin | Clean Code | The counterpoint: small functions, few comments, TDD | fact (debate) |
| Joran Greef and team | TigerBeetle, TigerStyle | Limits, assertions, zero debt, zero dependencies | fact (guide) |
| Sean Barrett | stb libraries | Single-file, dependency-free libraries | fact (repo) |
| Omar Cornut | Dear ImGui | Small core, sectioned headers, immediate-mode UI | fact (repo) |
| Ramon Santamaria | raylib | A flat, plainly named API anyone can learn | fact (repo) |
| Ryan Fleury | RAD Debugger | Group lifetimes | fact (essay) |
| Evan Todd | Lemma, DECEIVER | Honest catalog of bad game code and fixes | fact (talk) |
| Andrew Gallant (BurntSushi) | ripgrep | Tests, comments and structure praised on HN | opinion (HN) |
| Salvatore Sanfilippo (antirez) | Redis | Comments that explain tradeoffs | fact (repo), opinion (HN) |
| D. Richard Hipp | SQLite | Test discipline | fact (repo) |

## Codebases most often praised

From the 2019 "Ask HN: best codebases" thread (269 comments), the r/gamedev and r/C_Programming threads, and the Doom 3 reviews. Each repo below was verified on 2026-11-15 (cloned, last commit, license).

| Repo | Praised for | License | Last commit |
|---|---|---|---|
| [id-Software/DOOM-3-BFG](https://github.com/id-Software/DOOM-3-BFG) | Called the most beautiful game source by Fabien Sanglard and Shawn McGrath: const everywhere, few comments, a small C++ subset, every allocation tagged by subsystem ([List.h](https://github.com/id-Software/DOOM-3-BFG/blob/master/neo/idlib/containers/List.h)) | GPL-3.0, study | 2015 (archived) |
| [id-Software/Quake-III-Arena](https://github.com/id-Software/Quake-III-Arena) | Carmack himself thinks it may be cleaner than Doom 3 | GPL-2.0, study | 2012 (archived) |
| [postgres/postgres](https://github.com/postgres/postgres) | Most-recommended codebase in the HN thread: clear, well-commented C | PostgreSQL (permissive), borrow | 2026-11-14 |
| [NetHack/NetHack](https://github.com/NetHack/NetHack) | Decades of volunteer changes without spaghetti (HN) | NetHack GPL, study | 2026-11-14 |
| [BurntSushi/ripgrep](https://github.com/BurntSushi/ripgrep) | Tests, comments, structure (HN, multiple threads) | MIT or Unlicense, borrow | 2026-11-09 |
| [tigerbeetle/tigerbeetle](https://github.com/tigerbeetle/tigerbeetle) | The canonical TigerStyle codebase | Apache-2.0, borrow | 2026-11-10 |
| [nothings/stb](https://github.com/nothings/stb) | Drop-in, dependency-free libraries | Public domain or MIT, borrow | 2026-11-12 |
| [ocornut/imgui](https://github.com/ocornut/imgui) | Readable, battle-tested UI code | MIT, borrow | 2026-11-13 |
| [raysan5/raylib](https://github.com/raysan5/raylib) | Simplicity; an API you can learn in an afternoon | zlib, borrow | 2026-11-14 |
| [godotengine/godot](https://github.com/godotengine/godot) | Largest open engine; formatting enforced by clang-format in CI | MIT, borrow | 2026-11-14 |
| [bevyengine/bevy](https://github.com/bevyengine/bevy) | Data-driven engine where systems are plain functions | MIT or Apache-2.0, borrow | 2026-11-13 |
| [munificent/game-programming-patterns](https://github.com/munificent/game-programming-patterns) | The book's source | Text CC BY-NC-ND, code MIT | 2021 (finished) |
| [johnousterhout/aposd-vs-clean-code](https://github.com/johnousterhout/aposd-vs-clean-code) | The written debate | Not stated | 2025-04-15 |

`opinion` A counterweight from r/gamedev: open-source game code is often not clean, even from AAA studios. Pick the files people praise, not whole repos.

## What GitHub stars tell us

`fact` As of November 2026 the most-starred repositories are curated lists and learning resources (build-your-own-x, awesome, public-apis, freeCodeCamp), and the biggest risers this year are AI agent tools (openclaw, mattpocock/skills, obra/superpowers). ([gitstarclub 2026](https://gitstarclub.com/rankings/2026), [StackScan](https://www.stackscan.com/blog/github-statistics))

`ours` Stars measure attention, not code quality. Our list uses repeated praise from experienced engineers plus our own reading.

## Books

| Book | Access | Why |
|---|---|---|
| Game Programming Patterns (Nystrom) | Free online | Game loop, components, events, data locality |
| Crafting Interpreters (Nystrom) | Free online | Teaching-quality code |
| Data-Oriented Design (Richard Fabian) | Free online (dataorienteddesign.com/dodbook) | Acton's ideas in book form |
| The Architecture of Open Source Applications | Free online (aosabook.org) | Project leads explain their own designs |
| NASA Power of Ten (Holzmann) | Free PDF | The safety rules behind TigerStyle |
| OWASP Cheat Sheets | Free, already cloned | Security (step 5) |
| A Philosophy of Software Design, 2nd ed. (Ousterhout, 2021) | Paid; Kindle edition exists | Deep modules, comments, complexity |
| Designing Data-Intensive Applications (Kleppmann; 2nd ed. with Chris Riccomini) | Paid | Events, logs, data systems |
| Refactoring, 2nd ed. (Fowler) | Paid | JavaScript examples, our stack |
| The Design of Everyday Things (Norman, revised) | Paid | Interface |
| Game Engine Architecture (Gregory) | Paid | How engines are built |
| Code Reading (Spinellis) | Paid | How to read a codebase |
| The Art of Readable Code (Boswell, Foucher) | Paid; Ousterhout recommends it | Line-level clarity |

## Proposed changes to our standards (need the owner's yes)

1. **Naming:** units last (`timeout_ms_max`), no abbreviations, booleans named positively. Add to code-craft.md and a lint where possible.
2. **Assertions:** check assumptions in code. Programmer errors fail loudly; user and network errors are handled. Add to code-craft.md and common-ai-mistakes.md.
3. **Limits:** every loop, queue, batch and retry has a fixed upper bound. Fold into R20.
4. **Usage code first** for any new helper, endpoint or API. Add to the coder skill's plan step.
5. **Function size:** keep "about 60 lines gets a look," and add "split only when the new piece hides complexity behind a simple interface." Reject a hard line limit.
6. **Tests first (R33):** contested by Ousterhout. For AI agents, a failing test written first is the best defense against tests that check the mock. Keep it for bug fixes and core logic; allow writing tests right after a small slice elsewhere.
7. **Performance budget:** each spec names its budget (page weight, round trips, time to interactive) and the release checks it.

## Still to do

- Read X conversations, the key talks in full from their transcripts, and the paid books once access is set up.
- Search papers on AI-written code, code review and data design through research databases.
- Read Carmack's inlining email and Muratori's article directly; this pass used summaries and excerpts.
