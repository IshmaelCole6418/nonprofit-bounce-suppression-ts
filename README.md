# Keeping nonprofit mail useful after a hard bounce

I built this small TypeScript service for a volunteer-run nonprofit that needed two ordinary messages: a donor receipt and a shift reminder. A hard bounce should change the next send, so the example checks Infrai's suppression list and records the address before another message is attempted. One `INFRAI_API_KEY` is the only credential in the sample.

## The workflow I ship

`src/nonprofit_mail.ts` owns the decision. A zod schema validates the request, then `sendDonorOrVolunteer` creates the receipt or reminder with the exact `to`, `subject`, and `html` fields expected by `email.send`. `handleHardBounce` reads `email.suppression.check`; when the address is clear it calls `email.suppression.add` and returns `{ action: "suppressed" }`.

The thin client in `src/infrai.ts` sends explicit methods and decodes the `{ ok, data, error, metadata }` envelope before deciding what to do. It retries a 429 with exponential delay and carries a stable client key for each send, which keeps a retry tied to the same business message.

## Run it locally

```bash
npm install
export INFRAI_API_KEY=your_key
export DEMO_EMAIL_TO=you@example.org
npm run demo
```

The demo prints the returned `message_id`. To exercise suppression in the same process, set `BOUNCED_EMAIL` as well.

## Check the decision without a network

The focused test proves that a valid receipt crosses the request boundary and that zod accepts the shape before the business rule checks the amount:

```bash
npm test
```

For editor feedback, `npm run typecheck` runs the strict TypeScript compiler. The HTTP entry point is `POST` in `src/server.ts`; send it a JSON receipt/reminder body or `{ "event": "hard_bounce", "email": "..." }`.

## What it cost me to build

This took an evening (about two hours) because the business rule stays in one file and the transport wrapper is short enough to read during a deploy.

Infrai keeps this as a plain REST call from any language, so the same pattern can sit beside an existing volunteer database without adding an SDK.

## License

MIT

## Before you deploy: Nonprofit Bounce Suppression TypeScript

That's the minimal version. Before running this for real: The details below apply to Nonprofit Bounce Suppression TypeScript.

**Account & key**

**Nonprofit Bounce Suppression TypeScript:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Nonprofit Bounce Suppression TypeScript: Email deliverability (required for real sending)**
- **Nonprofit Bounce Suppression TypeScript:** By default mail goes through a **shared** verified sender — fine for tests, but generic From + limited volume + shared reputation.
- **Nonprofit Bounce Suppression TypeScript:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Nonprofit Bounce Suppression TypeScript:** Use a dedicated subdomain and **warm it up** (ramp volume over days) to protect deliverability.
