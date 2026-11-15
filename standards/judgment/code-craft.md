# Code craft

What makes a senior engineer open a repo and think "someone who knew what they were doing wrote this." Drawn from a project's structure rules and its Nov 15 cold read (`code`: receipts in the project handoff). The reference library (coming in step 4) adds exemplar repos for each point.

## Structure

- **Thin doors, shared cores.** Endpoints and pages check input, call a core module and answer. Logic used twice lives in a tested core module.
- **Dependencies point inward.** Shared helpers never import from an endpoint. (One project's shared helper imported `clientIp` from an endpoint.)
- **Folders by feature,** not one flat folder of 121 files.
- **File and function size:** a file over about 400 lines or a function over about 60 gets a look. A 2,756-line build file holding every page is a split waiting to happen.
- **One way to do a thing:** one DOM helper, one fetch helper, one date format, one error shape, one HTML escape.
- **Lists that drive behavior come from one exported list with a test.**

## Naming

Rules R36 to R38 in core-rules.md cover naming, assertions and calling code first. The why behind them is in library/who-to-learn-from.md.

- Names say what a thing is and why it exists. One-letter names only for loop indexes and tiny lambdas.
- The same word means the same thing everywhere. (One project's `esc` meant HTML escape in one file and regex escape in another.)
- Paired files share a stem: `flop-core.js` and `flop-page.js`.
- No secrets, keys or account values in names, headings or comments.

## Readability

- Comments explain why, and cite the rule or decision behind the code.
- Lines under 120 characters. Long parameter lists become an object with named fields.
- Delete dead code instead of commenting it out. TODO markers carry a date and an owner.

## Tests

- A real runner (`node --test`, Vitest), not a chain of commands that stops at the first failure.
- Tests sit beside the work and test behavior, not mocks.
- Independent answer keys for anything graded or calculated (R34).
- A local test server matches production routes, or render tests go stale silently.
- When a render test breaks, check the page first, then the test.

## Repo hygiene

- The README says what is true today. Session notes live in `docs/history/`, not the root.
- Format, lint and type check run in CI from day one (standards.yml).
- Conventional commit messages (`feat:`, `fix:`, `docs:`).
