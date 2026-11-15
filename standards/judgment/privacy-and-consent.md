# Privacy and consent

A gap no project had fully covered. This is the launch floor behind R29. Tags: `guess` until the research pass checks it against current law and the OWASP guides. Not legal advice; anything public still gets a lawyer's read.

## Before any launch that collects personal data

1. **Privacy page that matches the code.** What is collected, why (each purpose from the consents table), who it is shared with (each vendor that receives it), how long it is kept, and how to get it deleted. A test lists every vendor SDK and API the code calls and fails if the page does not name it.
2. **Consent recorded per field and purpose** (data-design.md section 4). Pre-checked boxes do not count.
3. **Unsubscribe in every marketing email.** A visible link plus the `List-Unsubscribe` and `List-Unsubscribe-Post` headers, so mail apps show one-click unsubscribe. Unsubscribing revokes the `marketing` consent and takes effect at once.
4. **Delete my data.** A self-serve request that runs the erase function, confirms by email, and finishes within 30 days. Test it on demo data every release that touches personal tables.
5. **Age and sensitive data.** If the product has an age floor (such as 21+ or adults only), check it at sign-up and record that consent. No sensitive data (health, finances, ID numbers) unless the feature needs it and the owner approves.
6. **People in media.** Blur bystanders; leave out minors unless written guardian consent is in hand .
7. **AI disclosure.** Say plainly what is AI-made, the same way everywhere .

## Bulk email

One recipient per message, never shared To or CC . Send from a domain with SPF, DKIM and DMARC set; move DMARC to quarantine after clean weeks .
