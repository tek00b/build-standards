# Data design

How to shape data so every project can grow into a social product without a rewrite. Rules R23 to R29 in core-rules.md are the floor; this file is the judgment above it.

Evidence: the default data layer is `code` . The social-network model below is a `requirement` from the owner, shaped by the research in library/social-data-research.md, and a `guess` until the first pilot app slice tests it.

## The model in one picture

```
people ──follows──▶ people
  │                    │
  ├─hosts─▶ occasions ◀─attends─┤
  │            │
  │            └─at─▶ places
  │
events (append-only): who did what, to what, when, why
consents: person × field × purpose, granted and revoked
```

## 1. Events are the history; state tables are what screens read

Decided 2026-11-15 (D17) after the research in library/social-data-research.md: full event sourcing costs more than it gives at our size.

- Every meaningful action writes its normal state row **and** one row in an append-only `events` table, in the same transaction, through one guarded function. Neither can exist without the other.
- Screens read the state tables, so nothing lags behind a write.
- `events` holds: id, actor_id, verb, object_type, object_id, occurred_at, payload, source. Payload holds IDs and codes only (D18): never a name, email, phone number or text a person wrote.
- Events are never updated or deleted, except the erase function swapping a person's ID for an anonymous one (section 4).
- Name verbs in the past tense, from the actor's view: `place_followed`, `place_unfollowed`, `trip_published`.
- Notifications, feeds, analytics and audited counts read events. They never write back into them.
- A scheduled check compares each count people see with what the events say, and alerts on drift.

Why: a feed, a notification and a monthly report all ask "what happened," and events answer that once. A project's show-up rate went past 100% because the counted state did not match what had happened; the drift check catches that class.

## 2. Stable IDs for people, places and times

- Every row gets a UUID primary key made by the database. Never use an email, phone, name or slug as a key.
- Outside IDs (Google place_id, Stripe customer, Spotify track) are columns with a unique index, never the key. Vendors change them.
- **Places** are a table: name, coordinates, IANA time zone, outside IDs. A city used by two trips is one row.
- **Times** are stored as `timestamptz` in UTC plus the place's time zone, so "Friday 9 pm local time" survives daylight saving.
- **Occasions** (a trip, a Friday night, a class) get their own row and ID. People attend occasions; occasions happen at places. This is what makes "who was there with me" a query.
- Slugs for URLs are a separate column and can change; links resolve by ID.

## 3. The graph of shared experience

- Relationships are rows in edge tables (`follows`, `attendances`, `hosts`), each with its own ID, created_at and the event that made it.
- Edges carry a state (`active`, `ended`) instead of being deleted, so history stays.
- Plan the three queries every social product needs, and index for them:
  1. Who do I follow, and who follows me.
  2. What is happening at occasions people I follow attend.
  3. Who shared an occasion with me.
- Counts shown to people (followers, attendees) come from the edge tables or a maintained counter, and a test checks they match.

## 4. Consent on every personal field

- Personal fields (email, phone, birthday, photo, location history) get one consent record per person, field and purpose: `consents(person_id, field, purpose, granted_at, revoked_at, source)`.
- Purposes are a short fixed list per project, such as `account`, `notifications`, `marketing`, `shared_with_hosts`.
- Each consent row also records `notice_version`: which wording the person agreed to (Kantara consent receipt, ISO/IEC 27560).
- Code reads personal fields through views or functions that check consent for the purpose at hand. No consent, no value.
- Consent is checked when something is queued for a person and again when it is sent.
- Public profiles show the minimum (first name plus last initial, as a project does), and functions never return email or phone to other users.
- Erase is a single function: it removes or blanks personal fields, rewrites the person's events to an anonymous actor, and logs that an erase happened. Test it on demo data.

## 5. Table checklist (from a project's structure rules)

Primary key, real foreign keys with a chosen on-delete rule, not null and check constraints, created_at, a `comment on table`, and indexes that follow the queries. A field you filter or count on gets its own column, never a key inside JSON.

## Worked example: the first pilot app follow-and-notify slice

1. Ana follows Ben: insert `events(actor=Ana, verb='followed', object=Ben)` and `follows(follower=Ana, followee=Ben, state='active')` in one transaction.
2. Ben publishes a trip: insert the occasion (trip) at its place, then `events(actor=Ben, verb='trip_published', object=trip)`.
3. A notifier reads new `trip_published` events, finds Ben's active followers, checks each follower's consent for `notifications`, and writes one `notifications` row per person, keyed on (event_id, person_id) so a retry never sends twice.
4. Tests: a stranger cannot read Ana's follows; a follower without consent gets nothing; running the notifier twice sends once.
