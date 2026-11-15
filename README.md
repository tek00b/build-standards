# Build standards

> Public review copy, shared for feedback. Suggestions are welcome through the Issues tab.

One set of build standards for every project, kept here so each fact has one home.

## What lives where

| Path | What it holds |
|---|---|
| `standards/core-rules.md` | The short list of rules, each with why, source, date, evidence tag and the check that enforces it |
| `standards/decisions.md` | the owner's decisions behind the rules |
| `rules/machine-rules.md` | How each automated check works and how to configure it |
| `checks/` | The check scripts (Node, no dependencies) |
| `.github/workflows/standards.yml` | The shared CI every project calls |
| `templates/` | Files a project copies in: workflow, config, retired terms |
| `test/` | Tests for the checks |
| `standards/judgment/` | Guidance for calls a machine cannot make: data design, interface, security, review, code craft, AI mistakes, privacy, operations |
| `standards/evidence/` | Conflicts and gaps from the project handoffs |
| `measure/review-misses.md` | Every miss by the AI reviewer, for measuring review quality |

