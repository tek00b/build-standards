# Agent brief: <job in a few words>

Copy this file, fill it in, then run `node checks/agent-brief.mjs <this file> <repo folder>` before launching the agent (R12). Launch only when it prints `agent-brief: ok`.

## Job
One paragraph: what to build or check, and what done means.

## Inputs
Every doc the agent must read, as a file path it can open. One per line. Write the doc to disk first if it lives somewhere the agent cannot reach.
- docs/specs/<spec file>.md

## Where to work
The folder, the branch, and whether the agent may write or only read.

## Never
What the agent must not touch (merges, deploys, migrations, payments, secrets, brand).

## Stop rule
If an input cannot be opened, or the brief disagrees with what the code shows, the agent stops and reports. It never builds from a guess.

## Report
What to send back: what is built and what is not, files touched, test and render results with real numbers, differences from the spec, open questions.
