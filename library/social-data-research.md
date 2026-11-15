# Research for the first social slice: follows, events, notifications, consent

Research pass, 2026-11-15, aimed at the first pilot app test slice (follow a place and dates, a host publishes a trip, matching followers get one notification). Same tags as who-to-learn-from.md:

- `fact`: sourced. Says what someone wrote, measured or did, with a link.
- `opinion`: someone's view, even a well-known one.
- `ours`: what this means for our standards, my read until the owner decides.

Not used: the Designing Data-Intensive Applications book (not bought, see who-to-learn-from.md), the Elicit connector (plan has no API access), and YouTube talks in full (the Kleppmann talk below has a written transcript).

## 1. How much event sourcing

- `fact` Kleppmann's "Turning the database inside out" (Strange Loop 2014, written transcript 2015) proposes treating a database as an always-growing collection of immutable facts, with indexes, caches and views derived from that log. ([kleppmann.com](https://martin.kleppmann.com/2015/03/04/turning-the-database-inside-out.html))
- `fact` Chris Kiehl's write-up after a year running an event-sourced system in production lists the costs: heavy plumbing, projections that lag behind writes and lose read-after-write consistency, old events made obsolete by changing requirements, and an audit log too noisy to use without filtering. His advice: don't adopt it without a concrete core problem it solves, and a history table gives about 80% of the audit value at much lower cost. (2019, [chriskiehl.com](https://chriskiehl.com/article/event-sourcing-is-hard))
- `fact` Learning.com's team reported after a year that event sourcing was not right for all their data, and that event volume grew their Redis memory by a gigabyte or more per week. ([Medium](https://medium.com/lcom-techblog/a-year-with-redis-event-sourcing-lessons-learned-6736068e17cc))
- `opinion` Several practitioners call building a whole system on event sourcing a common anti-pattern ([practiceoverflow](https://practiceoverflow.substack.com/p/event-sourcing-anti-patterns-10-ways)). Others keep it for one domain where history matters, such as scores or payments.
- `ours` Keep the events table, but as an append-only history written **in the same transaction** as the normal state tables. Reads use the state tables, so there is no projection lag. The events table feeds notifications, counts we want to audit, and analytics. A scheduled check compares derived counts to the events and alerts on drift. This is the "history table plus outbox" shape, not full event sourcing.

## 2. Writing a change and its event together

- `fact` The transactional outbox pattern writes the domain change and its event record in one database transaction, so one cannot exist without the other. Consumers deduplicate with a key such as the event ID, since delivery is at least once. ([microservices.io via levelup](https://levelup.gitconnected.com/transactional-outboxing-with-postgres-push-notifications-5cebdad893fd), [devbytes summary](https://devbytes.co.in/news/how-to-implement-the-outbox-pattern-using-postgres))
- `fact` Postgres `SELECT ... FOR UPDATE SKIP LOCKED` lets several workers claim different rows without blocking each other; the claim and the status change should happen in one statement. ([Crunchy Data](https://www.crunchydata.com/blog/message-queuing-using-native-postgresql), [Postgres docs](https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE))
- `fact` Supabase Queues is built on the pgmq extension: exactly-once delivery to a consumer within a visibility timeout, stored in Postgres, at no extra cost. ([Supabase docs](https://supabase.com/docs/guides/queues), [pgmq](https://github.com/pgmq/pgmq))
- `fact` pgmq has no built-in dead-letter queue, retry limit or failure alerting; a message that keeps failing comes back after each timeout forever. ([dev.to, tested on Supabase](https://dev.to/mwiginton/supabase-queues-in-production-dead-letter-queues-retries-and-poison-messages-with-pgmq-28dp))
- `ours` The slice already does this: state row plus event row in one function, and notifications keyed on (event_id, person_id). Whatever delivers them (a pgmq queue or a SKIP LOCKED table) gets a retry cap and a dead-letter state, per R20.

## 3. Fan-out: who gets the notification, and when it is computed

- `fact` Facebook's TAO paper models the social graph as typed objects and typed, timestamped associations, stores a bidirectional relationship as two edges, and keeps association counts. Reads were 99.8% of its workload. Because every viewer sees different content, Facebook filters with privacy checks each time content is viewed and pulls the graph rather than pushing it. (Bronson et al., USENIX ATC 2013, [paper](https://usenix.org/system/files/conference/atc13/atc13-bronson.pdf))
- `fact` Large feeds use a hybrid: copy a new post to followers' feeds at write time for ordinary accounts, and merge posts from accounts with very large followings at read time. Write cost grows with the author's audience, read cost with how many accounts the reader follows. ([PracHub](https://prachub.com/resources/designing-a-news-feed-who-pays-for-the-delivery), [Stream](https://getstream.io/blog/activity-feed-traffic-spikes/)). These are secondary write-ups, not Twitter's own documents.
- `ours` At our scale (a trip has dozens of matching followers, not millions) fan-out on write is right: the notifier writes one row per matching follower. Note the threshold for later. Borrow TAO's rule that privacy is checked at the moment of use: consent is checked when the notification row is written **and again** when the digest is sent.

## 4. How many notifications

- `fact` LinkedIn built Air Traffic Controller as the single gateway for almost all notifications after member complaints about volume. It merges duplicates, drops expired content, caps how many a member gets, and rate-limits the teams that send. ([LinkedIn Engineering, 2018](https://engineering.linkedin.com/blog/2018/03/air-traffic-controller--member-first-notifications-at-linkedin), [Samza case study](https://samza.incubator.apache.org/case-studies/linkedin))
- `fact` In a seven-week experiment with 17,500 users of a retail app, sending non-personalized push notifications more often raised uninstalls and lowered the open rate. (Wohllebe et al., 2021, Innovative Marketing, [Consensus](https://consensus.app/papers/details/w:4748c80b-25e5-4987-b4a7-851009bb5336/))
- `fact` A systematic review of 17 studies found active users tolerate more notifications, and recommends letting users set the frequency themselves. (Wohllebe, 2020, iJIM, [Consensus](https://consensus.app/papers/details/w:fd8c86c6-4222-447e-8162-50510a7f4ee1/))
- `ours` One gatekeeper function sends every message. It checks consent, the weekly cap, duplicates and whether the trip is still open. That matches the product doc's "one batched message a week unless the traveler asks for faster alerts on a specific trip."

## 5. Consent and erasure in an event log

- `fact` Personal data inside an immutable log conflicts with the right to erasure. The usual fixes are to keep personal data out of events and in a separate store that can be deleted, or to encrypt it per person and destroy the key ("crypto shredding"). ([JAX London](https://jaxlondon.com/blog/java-core-languages/gdpr-erasing-data-footprint/), [AxonIQ](https://www.axoniq.io/blog/protect-sensitive-data-in-an-event-sourced-application), [cqrs.com](https://www.cqrs.com/deeper-insights/gdpr-and-data-privacy/))
- `fact` Recording consent as an event makes it easy to show that consent was given. ([JAX London](https://jaxlondon.com/blog/java-core-languages/gdpr-erasing-data-footprint/))
- `fact` The Kantara consent receipt work, fed into ISO/IEC 27560 and built on ISO/IEC 29184, records a purpose, a legal justification for it, and the notice the person saw. ([Kantara](https://kantara.atlassian.net/wiki/x/SIIs), [OpenConsent](https://openconsent.atlassian.net/wiki/spaces/AD/pages/1676083331/Notice+and+Consent+Receipts+-+v1.2+Editorial))
- `ours` Events carry IDs only, never names, emails, phone numbers or free text a person wrote. Erasing a person then means blanking their rows and swapping their ID in events for an anonymous one, with no encryption keys to manage. Consent rows gain `notice_version` (which wording they agreed to). Colombia's Ley 1581 still needs the lawyer.

## 6. Locking down the data (RLS)

- `fact` Supabase's RLS guide: index the columns a policy filters on (over 100x faster on large tables in their test), wrap `auth.uid()` as `(select auth.uid())` so it runs once per query, and name the role with `to authenticated`. Their table shows 171 ms dropping to under 0.1 ms with an index, and 179 ms to 9 ms from the wrap. ([Supabase](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv), [GaryAustin1/RLS-Performance](https://github.com/GaryAustin1/RLS-Performance))
- `fact` Supabase recommends pgTAP tests run with `supabase test db`, the Basejump test helpers (`tests.create_supabase_user`, `tests.authenticate_as`, `tests.rls_enabled`), and giving each test suite its own user IDs instead of resetting the database. ([Supabase](https://supabase.com/docs/guides/database/postgres/testing-row-level-security), [helpers](https://github.com/usebasejump/supabase-test-helpers))
- `fact` Supabase's database advisor flags bare `auth.uid()` calls in policies (lint `auth_rls_initplan`). One team rewrote 76 policies after it fired. ([dev.to](https://dev.to/arvavit/76-rls-policies-rewritten-in-one-migration-the-authuid-init-plan-trap-in-supabase-4hg))
- `ours` Already mostly in R23 and R14. Add: `(select auth.uid())` and `to <role>` in every policy, an index on every policy column, and the advisor run in the release checklist.

## 7. AI-written code (adds to common-ai-mistakes.md)

- `fact` In a controlled study, participants with an AI assistant wrote insecure code more often on four of five tasks, and were more likely to believe their code was secure. Those who gave the assistant function declarations and clear task instructions got more secure code. (Perry, Srivastava, Kumar, Boneh, CCS 2023, [arXiv](https://arxiv.org/abs/2211.03622))
- `fact` 400 code samples refined over 40 rounds of AI "improvements" showed a 37.6% increase in critical vulnerabilities after five rounds, with patterns depending on the prompting style. (Shukla, Joshi, Syed, IEEE ISTAS 2025, [arXiv](https://arxiv.org/abs/2506.11022)). This is the primary source for the figure Kaspersky cited.
- `ours` Supports R38 (write the calling code and signatures first), a spec that names the functions, and a fresh reviewer after each round instead of the builder "improving" its own code in a loop.

## What changes for the slice

1. Events are an append-only history written with the state change, not the only source of state.
2. Events hold IDs only. Personal data lives in rows erase can blank.
3. Notifications: one row per (event, person), one gatekeeper function, a weekly cap, consent checked at write and at send.
4. Delivery work gets a retry cap and a dead-letter state.
5. Policies use `(select auth.uid())`, `to <role>` and indexed columns; tests run as a stranger and a second user.
6. The spec names every function signature before code.
