# Speed to Lead

Every inquiry gets caught, gets a drafted first reply, and stays visible until someone answers it.

A small app for the [Twenty](https://github.com/twentyhq/twenty) open source CRM, built for service businesses that lose customers to slow follow-up. Not affiliated with Twenty.

## What it does

- **Catches inquiries.** Web forms and missed-call tools post to one secured endpoint.
- **Saves first.** The inquiry is stored before any AI runs, so a failed draft never loses a lead.
- **Drafts a reply.** Claude writes a short reply from your business facts only. A person reads and sends it.
- **Tracks the clock.** Marking an inquiry Replied or Booked records minutes to first reply.
- **Shows who is waiting.** Unanswered inquiries move to the Still Waiting list after about 15 to 20 minutes (the check runs every 5 minutes), or your own limit.

## Setup

Needs Node 24.5 or newer and a Twenty workspace on version 2.56 or newer.

```bash
corepack enable
yarn install
npx twenty@latest auth login --url https://your-workspace.example.com --use
npx twenty@latest app apply --create
```

Then set these on the app:

| Variable | Purpose |
|---|---|
| `INTAKE_SECRET` | Required. Callers send it in the `x-intake-secret` header. |
| `ANTHROPIC_API_KEY` | Optional. Without it, inquiries save with no draft. |
| `BUSINESS_CONTEXT` | Services, area, hours and booking link the draft may use. |
| `OVERDUE_MINUTES` | Minutes before an inquiry counts as overdue. Default 15. |

## Sending an inquiry

```bash
curl -X POST https://your-workspace.example.com/s/inquiries \
  -H 'content-type: application/json' \
  -H "x-intake-secret: $INTAKE_SECRET" \
  -d '{"name":"Sam Rivera","phone":"+1 555 0100","message":"Do you service Tuesdays?","source":"WEB_FORM"}'
```

`email` or `phone` is required, and a value that does not look like an email or phone number is dropped. Add an optional `externalId` (for example the call or form id) so a retried request does not create a second inquiry. `source` is `WEB_FORM`, `MISSED_CALL`, `EMAIL` or `OTHER`.

## Tests

```bash
yarn test:unit
yarn typecheck
```

## Status

Unit tested (27 tests) and building. Not yet run against a live Twenty server.

- **Tested with a stand in client:** the first reply handler, the overdue sweep (including a reply landing mid sweep, hand made inquiries with no received time, and several pages), retry handling, draft saving, and the draft prompt. The tests do not touch Twenty itself.
- **Not verified live:** the GraphQL filters, the `orderBy` and paging arguments, and the new External ID field have not been run against a real Twenty server, so expect to adjust them on first install. The model name in `draft-reply.util.ts` could not be confirmed offline.
- **Known limits:** the overdue sweep reads each inquiry again just before writing, and a later sweep clears any flag left on a replied inquiry, but a reply in the same instant can still show as overdue for up to 5 minutes. Adding the External ID field changes the schema, so existing installs need to sync the app.

## Credit

Built on the Twenty app SDK and scaffolded with `twenty app init`. Twenty is by Twenty.com PBC and contributors.

MIT License.
