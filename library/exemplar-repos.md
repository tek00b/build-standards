# Reference library: well-built repos

Real code to learn from. A senior engineer judges code by comparing it with great code they have seen; this file is that comparison set. Each entry names patterns we use, with a link to the file that shows them, plus what not to copy.

**How this was built (2026-11-15).** Every repo was cloned and checked: it exists, its last commit date, its license. The files linked below were opened and read; patterns are described in our own words. Never copy large blocks of code into our projects. Link and describe the pattern instead.

**License column.** `borrow`: permissive license (MIT, Apache, public domain), so patterns and small snippets can be reused with attribution. `study`: copyleft or source-available license (GPL, AGPL, SSPL, custom). Read and learn the idea, but write our own code.

## Summary

| Repo | Fits | License | Last commit | Best for |
|---|---|---|---|---|
| [sindresorhus/ky](https://github.com/sindresorhus/ky) | JS, Node | MIT, borrow | 2026-10-09 | Error design, limits by default |
| [fastify/fastify](https://github.com/fastify/fastify) | Node APIs | MIT, borrow | 2026-11-13 | Request pipeline, error catalog |
| [colinhacks/zod](https://github.com/colinhacks/zod) | Validation | MIT, borrow | 2026-11-13 | Typed validation errors |
| [preactjs/preact](https://github.com/preactjs/preact) | Front end | MIT, borrow | 2026-11-15 | Small, documented core |
| [lichess-org/chessground](https://github.com/lichess-org/chessground) | Game trainers | GPL-3.0, study | 2026-10-20 | Tiny modules, one public API |
| [lichess-org/lila](https://github.com/lichess-org/lila) | Training sites | AGPL-3.0, study | 2026-11-14 | A free training site at scale |
| [phaserjs/phaser](https://github.com/phaserjs/phaser) | Games | MIT, borrow | 2026-08-21 | Module layout, API docs |
| [bluesky-social/atproto](https://github.com/bluesky-social/atproto) | Social data | Apache/MIT, borrow | 2026-11-14 | Records, stable IDs, follows |
| [mastodon/mastodon](https://github.com/mastodon/mastodon) | Social apps | AGPL-3.0, study | 2026-11-14 | Follow and notify services |
| [calcom/cal.com](https://github.com/calcom/cal.com) | Next.js + Postgres SaaS | MIT core, borrow | 2026-11-13 | Idempotent bookings, cost buckets |
| [supabase/supabase](https://github.com/supabase/supabase) (examples) | Postgres, RLS | Apache-2.0, borrow | 2026-11-15 | Commented schemas, permissions as data |
| [tldraw/tldraw](https://github.com/tldraw/tldraw) | TS app, data | tldraw license, study | 2026-11-13 | Versioned record migrations |
| [sqlite/sqlite](https://github.com/sqlite/sqlite) | Testing | Public domain, borrow | 2026-11-15 | Test discipline |
| [redis/redis](https://github.com/redis/redis) | Code clarity | RSAL/SSPL/AGPL, study | 2026-11-14 | Comments that explain tradeoffs |
| [munificent/craftinginterpreters](https://github.com/munificent/craftinginterpreters) | Readable structure | MIT code, borrow | 2024-08-01 (finished book) | Teaching-quality code |
| [google/eng-practices](https://github.com/google/eng-practices) | Review | CC-BY 3.0 | 2024-09-18 (stable guide) | The reviewer's standard |
| [OWASP/CheatSheetSeries](https://github.com/OWASP/CheatSheetSeries) | Security | CC-BY-SA 4.0 | 2026-11-15 | Security reference (read in step 5) |

## Notes per repo

### sindresorhus/ky
- **One error family.** Every error extends one base class, and the base class doc says what is and is not in the family and why ([KyError.ts](https://github.com/sindresorhus/ky/blob/HEAD/source/errors/KyError.ts)). Callers can catch "anything from this library" or one exact case.
- **Errors carry what you need to debug.** The HTTP error message names the status, the method and the URL; the error object holds the request, the response and parsed data ([HTTPError.ts](https://github.com/sindresorhus/ky/blob/HEAD/source/errors/HTTPError.ts)).
- **Limits by default.** Reading an error body is capped at 10 MiB and bounded by the request timeout, and the doc says exactly which error you get when a cap is hit. Our R20 in practice.
- Use for: our fetch helper and error shape (code-craft "one error shape").

### fastify/fastify
- **The request lifecycle is an explicit pipeline:** content type, pre-validation hooks, schema validation, pre-handler hooks, handler ([handle-request.js](https://github.com/fastify/fastify/blob/HEAD/lib/handle-request.js)). Each step can stop the request with a clear error. Our "thin doors" rule, done at framework level.
- **An error catalog with stable codes.** Every error has a code (`FST_ERR_...`), a message and an HTTP status in one file ([errors.js](https://github.com/fastify/fastify/blob/HEAD/lib/errors.js)). Errors caused by bad input skip the stack trace, so logs stay clean.
- **Comments cite the reason:** the RFC section or the pull request that decided a behavior.
- Use for: an `errors.js` catalog per project; schema validation on every endpoint.

### colinhacks/zod
- **Validation errors are data, not strings.** Each issue has a code (`invalid_type`, `too_big`), a path to the field, the expected value and a message ([errors.ts](https://github.com/colinhacks/zod/blob/HEAD/packages/zod/src/v4/core/errors.ts)). Pages can show the right message on the right field; logs can count failures by code.
- Use for: validating every request body at the edge (common-ai-mistakes #7).

### preactjs/preact
- **A small core where every exported function has a doc comment** saying what it does and what each parameter is ([component.js](https://github.com/preactjs/preact/blob/HEAD/src/component.js)).
- **Comments explain surprising choices and link the issue** ("some libraries mark state as readonly, so we clone; see #2716").
- **Named constants** for flags instead of magic numbers.

### lichess-org/chessground
- **Many small files, each with one job:** animation, drag, draw, FEN parsing, render, premove ([src/](https://github.com/lichess-org/chessground/tree/HEAD/src)). The largest is a few hundred lines.
- **State without the page, then the page.** Board state can exist without the DOM; rendering attaches later ([chessground.ts](https://github.com/lichess-org/chessground/blob/HEAD/src/chessground.ts)). That makes logic testable without a browser.
- **One public API, documented line by line** ([api.ts](https://github.com/lichess-org/chessground/blob/HEAD/src/api.ts)).
- **Redraws batched to one per animation frame.**
- Study only (GPL). Closest match to our trainer apps.

### lichess-org/lila
- A free, open training site with puzzles at very large scale, organized as one module per feature under `modules/`. Scala, so study the structure and product decisions, not the code. AGPL.

### phaserjs/phaser
- **Top-level folders by domain** (`animations`, `cameras`, `input`, `physics`, `scene`, `sound`, `time`, `tweens`), the "feature folders" rule at scale.
- **Every public property documented** with its type and the version it arrived in ([Game.js](https://github.com/phaserjs/phaser/blob/HEAD/src/core/Game.js) has 40 `@since` tags). MIT.

### bluesky-social/atproto
- **A follow is a record:** subject, created time, and an optional reference to how you found them ([follow.json](https://github.com/bluesky-social/atproto/blob/HEAD/packages/api/lexicons/app/bsky/graph/follow.json)). Records are the source of truth and views are built from them, which matches data-design.md section 1.
- **Stable IDs:** people are identified by a DID that survives a handle change; record keys are time-ordered IDs (TIDs).
- **Duplicates are ignored by the indexer**, so a repeated follow is harmless.
- **Schemas as data:** every record type is a versioned JSON schema (Lexicon). Use for: the first pilot app's follows, trips and notifications.

### mastodon/mastodon
- **Follow as a service with guard clauses up front:** not possible (missing or self) is a not-found, not allowed (blocked, moved, domain blocked) is a permission error, already following updates options instead of failing ([follow_service.rb](https://github.com/mastodon/mastodon/blob/HEAD/app/services/follow_service.rb)).
- **Slow work leaves the request:** notifications and feed merges go to background workers.
- **Notification policy per recipient:** filters for new accounts, people you do not follow and recent followers, with the thresholds as named constants ([notify_service.rb](https://github.com/mastodon/mastodon/blob/HEAD/app/services/notify_service.rb)). A worked model for consent-aware notifications.
- Study only (AGPL). The closest real system to the first pilot app follow-and-notify slice.

### calcom/cal.com
- **Public ID apart from the internal ID,** and an **idempotency key with a unique index** so the same slot cannot be booked twice ([schema.prisma](https://github.com/calcom/cal.com/blob/HEAD/packages/prisma/schema.prisma), model `Booking`).
- **Rate limits in named buckets by cost:** core, api, ai, sms, a monthly SMS cap ([rateLimit.ts](https://github.com/calcom/cal.com/blob/HEAD/packages/lib/rateLimit.ts)). Our R21.
- **Do not copy:** the limiter fails open. With no key, or on any error, it allows the request. Our R14 says fail closed on cost paths.

### supabase/supabase (examples)
- **Every table and key column has a comment;** RLS on every table; policies named in plain English; **permissions as data** (`role_permissions` table plus an `authorize()` function) ([Slack-clone init migration](https://github.com/supabase/supabase/blob/HEAD/examples/slack-clone/nextjs-slack-clone/supabase/migrations/20240214102356_init.sql)).
- **Do not copy:** its security definer function sets `search_path = public` (we require an empty search path), policies call `auth.uid()` without wrapping it in `select`, and update policies lack `with check`. Our R23 and security.md are stricter.

### tldraw/tldraw
- **Versioned migrations with IDs, dependencies and validation,** each with a documented example ([migrate.ts](https://github.com/tldraw/tldraw/blob/HEAD/packages/store/src/lib/migrate.ts)).
- **A test file beside nearly every source file** in the store package.
- Study only (tldraw license requires a key in production).

### sqlite/sqlite
- **Test-writing rules written down:** each test runs in safe mode, uses an in-memory database, holds the minimum data to show the behavior, and pairs every case with its check ([writing-test-cases.md](https://github.com/sqlite/sqlite/blob/HEAD/doc/writing-test-cases.md)). Older tests that break the rules are named as "not a model to follow."
- Public domain.

### redis/redis
- **Comments that state the tradeoff and the road not taken:** the timer lookup is O(N), here is why that is fine, and here are two faster designs if it ever matters ([ae.c](https://github.com/redis/redis/blob/HEAD/src/ae.c)).
- Study only (source-available license since Redis 8).

### munificent/craftinginterpreters
- **Code written to be read:** one class per concept, a keyword table up front, short methods named for what they scan ([Scanner.java](https://github.com/munificent/craftinginterpreters/blob/HEAD/java/com/craftinginterpreters/lox/Scanner.java)). The whole book is free online.

### google/eng-practices
- **The reviewer's standard:** approve once a change definitely improves the overall health of the code, even if it is not perfect ([standard.md](https://github.com/google/eng-practices/blob/HEAD/review/reviewer/standard.md)).
- **What to look for, in order:** design, functionality, complexity, tests, naming, comments, style, consistency, documentation, every line, context, good things ([looking-for.md](https://github.com/google/eng-practices/blob/HEAD/review/reviewer/looking-for.md)). Our rubric in review.md lines up with it; "good things" (say what was done well) is worth adding.

## More repos

Game-programming and general exemplars verified in the research pass live in [who-to-learn-from.md](who-to-learn-from.md#codebases-most-often-praised), so each repo has one home.

## Next

- Turn each pattern into a rubric line with a good and a bad example (handoff step 3).
- Build before-and-after pairs from our own code (handoff step 4).
- Add repos as gaps appear: a Postgres-heavy Node API, a payments integration, an accessible component library.
