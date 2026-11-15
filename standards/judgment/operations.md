# Operations

Keeping live systems recoverable, observed and fast. Mostly gaps across the source projects; tags `guess` until the first pilot app slice and research pass test them.

## Backups and restore tests

- Know where each data store's backups live, how far back they go and how to restore. Write it in the project's facts file (R11).
- A backup you have never restored is a hope. Once a quarter, restore into a branch or scratch project, run the app's tests against it, and log the date and result. A scheduled task does this, not a person remembering.
- Files in storage buckets need their own backup plan; database backups do not cover them.

## Error monitoring

- Every project reports server and browser errors to one place (a project uses Sentry). Errors tell us, not them (One project's error rule): users see a plain message, logs get the detail.
- Alerts go to the owner only for new errors and spikes, not every event.
- Never log secrets or full personal data.

## Performance

- Budgets checked on the phone profile: Largest Contentful Paint under 2.5 s, Interaction to Next Paint under 200 ms, Cumulative Layout Shift under 0.1 (Google's Core Web Vitals "good" thresholds).
- Test heavy pages at 4x CPU throttle .
- Budget search and loops by a count that does not depend on the device.

## Releases

- Every release records live and rollback deploy IDs (R13) and is checked live after deploy by fetching the page and confirming the change (R05).
- A release step compares docs to what is live (R09): README, facts file, privacy page vendor list.
- Spend alerts and caps on every paid platform (Supabase, Vercel, AI APIs).

## Monthly review

A scheduled task on the 1st reads every project's CI history, review misses and open gaps, proposes rule changes with evidence, and messages the owner. Rule changes still need his yes.
