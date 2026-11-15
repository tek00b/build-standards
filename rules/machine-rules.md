# Machine checks

How each check works and how a project configures it. The rules themselves live in standards/core-rules.md; this file only links to them.

| Check | Enforces | Runs where | Fails when | Config (standards.config.json) |
|---|---|---|---|---|
| format, lint, typecheck, test, build | R15 | standards.yml | the project's npm script fails, or the script is missing and not in `allow-missing` | `allow-missing` input in the project workflow |
| retired-terms | R08 | standards.yml, `checks/run-all.mjs` | a tracked text file uses a term from `retired-terms.txt`, or that file is missing | `retiredTerms.ignore`: path prefixes to skip |
| env-example | R02 | same | code reads an environment variable not listed in `.env.example`, or `.env.example` holds a value | `envExample.ignore`, `envExample.platformVariables` |
| doc-duplicates | R01 | same | a Markdown block of 160+ characters appears in two files | `docDuplicates.ignore` |
| writing-style | R31 | same | an em dash or "it's not X, it's Y" in Markdown, HTML, text or page components | `writingStyle.ignore` |
| jscpd | R01 | standards.yml | any repeated code block of 70+ tokens | `allow-missing: duplicates` while paying down |
| gitleaks | R02 | standards.yml, self-test | a secret-looking string anywhere in Git history | none; never skippable |
| semgrep | R20 | standards.yml | a finding from the `p/default` rule set | `allow-missing: security` while adopting |
| npm audit | R22 | standards.yml | a high or critical advisory | none; never skippable |
| key-account | R03, R04 | the project's deploy, before the build | a key belongs to another account, a live Stripe key is outside production, a test key is in production, or a lookup fails | `accounts.stripe`, `accounts.supabase`, `accounts.resend` |

## Wiring key-account into a deploy

Put it in front of the build command, so a wrong key stops the deploy before anything goes live:

```
node .standards/checks/key-account.mjs && next build
```

The project's build step needs the standards checked out (or a copy fetched at build time). This gets settled in the first thin slice.

## Known limits (re-test in the first pilot app slice)

- Stripe restricted keys need read access to account details for the account match. Without it the check fails unless `allowUnverifiedRestrictedKey` is set.
- Resend sending-only keys cannot list domains, so the domain match is reported as a note, not proven.
- The Supabase key test uses the project's `/auth/v1/settings` endpoint. A key from another project is refused there; confirm this against a real wrong-project key before relying on it.
- jscpd and semgrep run at a major version or `latest`. Pin exact versions after the first green run (R22).
