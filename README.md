# The Lost & Found Matcher

A small, complete web app for a university Lost & Found desk. Students report items they **lost** or **found**; the app **suggests and explains** likely matches; a **staff member verifies ownership and confirms**. The app never decides on its own.

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript, Zod, Prisma
- **Database**: PostgreSQL 16 (Docker)
- **Matching engine**: pure TypeScript functions, unit-tested with Vitest. No AI needed.

---

## How to run

**Prerequisites:** Node 20+ and Docker (running).

```bash
npm run setup   # install, start Postgres (docker compose), migrate, seed demo data
npm run dev     # API on http://localhost:4000, web on http://localhost:3000
npm test        # 52 tests – no database, no network, no AI key needed
```

`npm run setup` creates `backend/.env` and `frontend/.env` from the `.env.example` files if they are missing. PostgreSQL is exposed on host port **5440** rather than 5432, so it doesn't clash with a Postgres already installed locally.

**Try it**

| As | Do |
|---|---|
| Student | Home → *I lost something* → describe it → see matches and *why* they matched |
| Student | *My reports* → `amina@example.edu` or `+251911000111` |
| Staff | **Staff sign-in** in the header, passcode `staff-demo` (from `backend/.env`) → *Staff review* → compare private details and photos → *Confirm* → tick verification → *Mark returned* |

To reset the demo data: `npm run db:reset`.

## Screenshots

_Screenshots live in [`/docs/screenshots`](docs/screenshots)._

<!-- ![Home](docs/screenshots/home.png) ![Report form](docs/screenshots/report.png) ![Staff review](docs/screenshots/staff.png) -->

---

## Problem analysis

Matching lost and found reports is not a search problem. Two strangers describe the same object **from memory, at different times, in different words**. I designed around six concrete problems:

| # | Problem | Example | How the app handles it |
|---|---|---|---|
| 1 | **Vocabulary mismatch** | "AirPods case" vs "wireless earbud case"; "backpack" vs "bag" | Words are normalised into shared *concepts* (`airpods`, `earbuds` → `audio`) via a small dictionary, then compared by overlap |
| 2 | **Subjective colours** | "black" vs "dark", "navy" vs "blue" | Colours are compared as **families** (Black/dark, Blue/navy …), not exact names. "Not sure" is a valid answer and scores neutral |
| 3 | **Uncertain time and place** | "between 12 and 5, library or coffee shop – or I don't know" | Owners give a **time window** and **several places** (or *Not sure*). Neighbouring places get partial credit. Unknown is neutral, not a penalty |
| 4 | **Impossible matches** | Found *before* it was lost; a phone vs earbuds; found weeks later across campus | **Hard rules** remove impossible pairs before scoring; "much later *and* far away" caps the result at Weak |
| 5 | **False claims** | Someone reads the public listing and claims the item | Each report has a **private detail** and an optional **photo** (for the owner: one taken *before* the loss), both shown only to staff. Staff compare owner vs finder side by side and ask a generated verification question. *Mark returned* is disabled until they tick that the owner answered correctly |
| 6 | **Vague descriptions** | "lost my bag somewhere" | A **clarity check** asks 1–3 follow-up questions while the person is typing. Vague reports still match, but with lower scores |

## Approach

1. **Collect structured data where people can answer, free text where they can't.** Category, colour family, places and time window are chips and pickers. "Not sure" is always available. The description stays free text.
2. **Score with transparent rules.** Each pair gets a 0–100 score made of five components. Every component produces a human sentence, and the UI shows those sentences instead of the bare number.
3. **Humans decide.** Students only see that there are possible matches and why. Staff see everything, compare private details, and confirm, reject or undo. Rejected pairs are never suggested again.
4. **AI is an optional helper, not the judge.** It can pre-fill form fields and phrase follow-up questions. Without a key, keyword rules do the same job.

## How matching works

```mermaid
flowchart TD
  submit[Student submits report to POST /api/reports] --> validate{Zod validation}
  validate -->|invalid or bad photo| fix[400 with field errors shown inline]
  fix -->|edit and resubmit| submit
  validate -->|ok| save[Save report as OPEN in PostgreSQL]
  save --> prefilter[SQL prefilter: opposite type, OPEN, not expired, same category, date window]
  prefilter --> hard{Hard rules for each pair}
  hard -->|impossible or REJECTED before| drop[Excluded, never shown]
  hard -->|passes| score[Score 0 to 100 from 5 signals, cap on red flags]
  score -->|below 30| drop
  score -->|STRONG, POSSIBLE or WEAK| respond[201 response with top matches and follow up questions]
  save --> clarity{Gemini clarity check}
  clarity -->|ok: AI reworded questions| respond
  clarity -->|AI off, timeout or bad JSON: rule based questions| respond
  respond --> review{Staff review at GET /api/matches}
  review -->|Not a match| rejected[MatchDecision REJECTED, never suggested again]
  review -->|Confirm| pending[Both reports MATCH_PENDING]
  pending -->|owner passes verification| returned[Both reports RETURNED]
  pending -->|Undo| reopened[Both reports back to OPEN and matched again]
```

### How it works

- **Validate:** every field is checked with Zod: title length, at least one place, no future dates, a valid contact, and photos must really be JPEG, PNG or WebP. Errors come back per field, so the form jumps to the right step instead of losing what the person typed.
- **Save:** the report is stored as `OPEN`. Private details, contacts and photos are saved too, but only signed-in staff can ever read them.
- **Clarity check:** if the description is vague, the reporter gets 1–3 follow-up questions. Gemini only rewords them. When the AI is off, times out or returns bad JSON, the rule-based questions are used, so the app never depends on the AI.
- **SQL prefilter:** one indexed query keeps only reports that could possibly match: opposite type, `OPEN`, not expired, same category, and a plausible date window. The engine doesn't waste time scoring the rest.
- **Hard rules:** pairs that can't be the same item are dropped and never shown: phone vs earbuds, found before it was lost, found more than 30 days later, or already marked *Not a match* by staff.
- **Score:** five signals add up to 0–100: item type 25, matching words 30 (synonyms like AirPods ≈ earbuds count), colour family 15, place 15 (neighbouring places get partial credit), time 15. Each signal produces a sentence staff can read. A colour or brand conflict caps the result at `POSSIBLE`; found much later and far away caps it at `WEAK`. Below 30 it is hidden. All numbers are in [`constants.ts`](backend/src/matching/constants.ts).
- **Respond:** the reporter sees their best matches with the reasons, but never the other person's contact or private details.
- **Staff review:** staff compare the owner's and finder's private details and photos. *Not a match* stores a `REJECTED` decision so the pair is never suggested again. *Confirm* sets both reports to `MATCH_PENDING` in one transaction.
- **Handover:** the owner must answer the verification question before staff can mark both reports `RETURNED`. *Undo* puts both back to `OPEN`, and they're matched again.

## Assumptions

- One campus with about 13 named places, with "next to" relationships configured in [`shared/src/campus.ts`](shared/src/campus.ts).
- Finders hand items in at the desk, so the "found" report is about a single moment (start = end).
- Reporters can give at least an item type. Everything else may be "Not sure".
- Expiry is 30 days, computed when read (no cron job). Staff can close any report manually.
- Students have no accounts: reporting something should take a minute, not a sign-up. They follow their reports by the email or phone they entered.
- Staff sign in with a shared passcode (`STAFF_PASSCODE`). In production this would be the university's SSO with individual staff accounts.
- Dates are stored in UTC and shown in the viewer's local time.

## Key technical decisions

| Decision | Why |
|---|---|
| **Next.js (App Router)** | File-based routing, good TypeScript support and fast to build a polished multi-page UI. The pages are client components talking to a separate API, so the frontend could be swapped out without touching the backend. Pinned to the latest 14.2.x. Some Next.js advisories are only fixed in 15+, and they concern features this app does not use (image optimisation, middleware, Server Actions). |
| **Express (separate API)** | A small, well-known HTTP layer that keeps the matching engine and the database independent of the UI framework. Routes stay thin: validate (Zod) → service → JSON. |
| **PostgreSQL over MongoDB** | The data is relational and benefits from constraints: lost/found decisions reference both reports, `UNIQUE(lostId, foundId)`, `CHECK (eventEnd >= eventStart)`, composite indexes for the pre-filter, and a confirm that must update two reports and a decision **in one transaction**. Arrays (`locations text[]`) cover the one document-like field. Postgres also opens the door to `pgvector` later. |
| **Rules, not AI, as the judge** | Matching decides whose phone someone walks away with. It must be **deterministic, explainable and testable**: the same input always gives the same score, every point has a sentence, and the edge cases are pinned by unit tests. An LLM would be harder to audit and could be prompt-injected by a description. |
| **Photos verify, they don't score** | A photo the owner took *before* the loss is strong ownership evidence, so staff see it next to the finder's photo. It is **not** fed into the score: comparing images would need AI to judge matches, generic items (every black AirPods case) look alike, and a stock photo proves nothing; only a human can judge a personal photo. Photos are staff-only (they often show faces, rooms or lock screens), checked by file signature rather than file name, limited to 5 MB, resized in the browser (which also strips EXIF/GPS), served with `no-store`, and never in public responses. |
| **Staff login, anonymous students** | The private detail, contacts and photos are what stop false claims, so they must be protected **by the server**, not just hidden in the UI. Staff sign in with a passcode; the server sets an **HMAC-signed, httpOnly, SameSite=Lax session cookie** (8 h) that page scripts can't read and nobody can forge or extend. Every staff route checks it (401 otherwise); wrong passcodes are rate-limited (5 per 15 min per client) and compared in constant time. Students stay anonymous so reporting stays quick. A shared passcode is a deliberate stand-in for SSO, not the end state. |
| **AI optional** | The app must run anywhere, offline, at zero cost. If `GEMINI_API_KEY` is set, the model in `GEMINI_EXTRACTION_MODEL` is used for (a) suggesting form fields from free text, or from the photo when the person clicks *Suggest fields from photo*, and (b) phrasing clarity questions. Output must be strict JSON validated by Zod, with a 5 s timeout. On any failure the app falls back to rules and logs a warning. The rules still decide *whether* a report is vague, and the person confirms every suggested field. Only the public title and description are sent, never private details or contact info. |
| **Pure matching module** | `backend/src/matching` imports nothing from Express or Prisma. It is plain data in, plain data out, which makes it trivial to test and to explain. |
| **Shared package** | Categories, campus layout, colour families and types live in `/shared` and are used by both the frontend and the backend, so the form chips and the engine can't drift apart. |

## AI usage

TODO: written by me

---

### Project layout

Both apps are organised by **layer**, and each layer has one file per resource (reports, matches, assist, stats). A request flows **route → middleware → controller → validator → service → model**, and every layer only calls the layer below it.

```
backend/
├── prisma/
│   ├── schema.prisma              tables, enums, indexes
│   ├── migrations/                SQL incl. CHECK (eventEnd >= eventStart)
│   └── seed/                      index.ts (runner) + reports.data.ts (demo data) + photos/ (2 demo images)
├── src/
│   ├── server.ts                  starts the HTTP server
│   ├── app.ts                     Express app: CORS, JSON, /api, error handling
│   ├── config/                    env.ts (validated env + AI config), database.ts (Prisma client)
│   ├── routes/                    index.ts mounts reports / matches / assist / stats routers
│   ├── middlewares/               require-staff.ts (session cookie check), upload.ts, error-handler.ts
│   ├── controllers/               HTTP in/out only: validate input → call service → send JSON
│   ├── validators/                Zod schemas for every request body/query (+ AI output schemas)
│   ├── services/                  business logic + transactions; photo.service.ts (staff-only uploads); services/ai/ = Gemini client + prompts
│   ├── models/                    all Prisma queries: report.model.ts (incl. SQL pre-filter), match-decision.model.ts
│   ├── interfaces/                backend DTO / row types
│   ├── utils/                     errors, async-handler, validate, serializers (public vs staff), status messages
│   └── matching/                  THE ENGINE – pure TypeScript, no Express/Prisma
│       ├── constants.ts           weights, time rules, bands
│       ├── concepts.ts            synonym dictionary, stop words, brands
│       ├── normalize.ts           text → concept tokens + colour mentions
│       ├── rules.ts               hard rules (impossible pairs)
│       ├── scoring.ts             the five scored components
│       ├── engine.ts              pair pipeline, caps, bands, findMatchesFor
│       ├── clarity.ts · extraction.ts · verification.ts
│       └── types.ts · index.ts
└── tests/                         mirrors src/: matching/, services/, validators/, utils/, fixtures/

frontend/
├── app/                           routes only – each page.tsx renders one page component
├── components/
│   ├── ui/                        Button, Card, Chip, Badges, ScoreBar, ReasonList, States…
│   ├── layout/                    Header, RoleToggle (staff sign-in / sign-out), StaffLoginForm
│   ├── home/ · reports/ · my-reports/ · staff/
│   └── report-form/               ReportWizard, Stepper, steps/{Item,PlaceTime,Contact}Step, PhotoField, QualityHint, SuggestionPanel, SubmittedView
├── services/                      api-client.ts + one service per API resource
├── hooks/                         useClarityCheck, useStaffMatches, useAiStatus, useDebouncedValue
├── context/                       RoleContext (role comes from the server session), ToastContext
├── interfaces/                    API + form types
├── utils/                         format (local time), validation, time-presets, storage, cx
└── config/                        env (API URL), constants

shared/src/                        categories, campus, colours, types – used by both apps
```

### API

| Method | Path | Who | Notes |
|---|---|---|---|
| POST | `/api/reports` | anyone | validate + save; returns the report, top matches and clarity questions. JSON, or multipart with `data` (JSON) + optional `photo` |
| GET | `/api/reports/:id/photo` | staff | the staff-only photo (`Cache-Control: private, no-store`) |
| GET | `/api/reports?type=&status=&q=&category=` | anyone | public fields only (staff also get contact and private detail) |
| GET | `/api/reports/mine?contact=` | anyone | own reports, status, match count, friendly message |
| GET | `/api/stats` | anyone | numbers for the home page |
| POST | `/api/auth/staff/login` | anyone | `{passcode}` → sets the staff session cookie; 401 wrong, 429 too many attempts |
| POST | `/api/auth/logout` · GET `/api/auth/me` | anyone | clear the cookie · current role |
| GET | `/api/matches?band=` | staff | suggestions grouped by lost report and pairs awaiting handover |
| POST | `/api/matches/confirm` · `reject` · `undo` | staff | `{lostId, foundId}`; confirm is one transaction |
| POST | `/api/matches/returned` | staff | `{lostId, foundId, verified: true}`; refused without `verified` |
| POST | `/api/reports/:id/close` | staff | |
| POST | `/api/assist/extract` · `clarity` | anyone | AI if configured, otherwise rules |
| POST | `/api/assist/extract-photo` | anyone | multipart `photo`; AI only (empty suggestions without a key); photo is not stored |

Errors are always `{ "error": { "message": "...", "fields": { "title": "At least 3 characters" } } }` with status 400, 401, 404, 409 or 429. *staff* routes require the signed session cookie.
