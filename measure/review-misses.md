# Review misses

Step 7 of the plan: measure review quality. Every time CI, a human reviewer, a fix checker or production finds something the AI reviewer missed, add one row. The monthly review reads this file, groups misses into patterns, and proposes new lines for judgment/common-ai-mistakes.md or new checks.

Agreement rate = findings both the AI reviewer and the human found, divided by everything the human found. Log it per calibration review.

| Date | Project | Change (PR or commit) | Found by | What was missed | Severity | Pattern | Fix to the standards |
|---|---|---|---|---|---|---|---|
