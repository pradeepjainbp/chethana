# Chethana — Personal Health Companion

> A calm, intelligent health app. Breathing · Fasting · Nutrition · Gut Health.
> Live at [chethana.pradeepjainbp.in](https://chethana.pradeepjainbp.in)

---

## Stack

| Layer       | Choice                                      |
|-------------|---------------------------------------------|
| Framework   | Next.js 15 App Router + TypeScript          |
| Styling     | Tailwind CSS + custom design tokens         |
| Database    | Neon (Postgres 17) + Drizzle ORM            |
| Auth        | Neon Auth (Better Auth) + Google OAuth      |
| AI          | Gemini 2.5 Flash via Cloudflare Worker proxy|
| File storage| Cloudflare R2 (blood test PDFs)             |
| Hosting     | Cloudflare Pages (OpenNext adapter)         |
| State       | Zustand (breathing sessions)                |

---

## Features — Build Status

### Phase 0 — Visibility ✅
- Coming-soon page, sandbox nav tab, subdomain live

### Phase 1 — MVP ✅
- Google OAuth sign-in (Neon Auth)
- 6-step onboarding wizard (profile persisted to Neon)
- Dashboard: greeting, action cards, profile completion bar
- **Breathing engine**: Wim Hof + Anulom Vilom with TTS narration, Zustand store, session saving
- **Fasting engine**: 11-stage tracker, protocol picker (12:12 → 24h → Custom), live countdown, chime on stage transition, summary card
- **Water tracker**: SVG ring, quick-add buttons, daily log
- Profile page, disclaimer, sign-out

### Phase 2 — Intelligence ✅
- Cloudflare Worker + Gemini 2.5 Flash proxy (rate-limited)
- Blood test PDF upload → Gemini Vision extraction → verify → save; HOMA-IR + TG/HDL auto-calculated
- Meal logging: free-text → Gemini → structured JSON (insulin impact, gut impact, plant foods, Vaidya feedback)
- **Plant diversity tracker**: 7-day unique plant count (X/30) on dashboard
- **Breathing techniques expanded**: Box (4-4-4-4) · Kapalbhati · Bhramari · Om — all with narration, BreathCircle, session saving
- **AI Vaidya Note**: personalised daily note generated from 7-day activity; cached in sessionStorage (one Gemini call/day)
- Improved singing bowl chime (3-layer detuned harmonic synthesis)

### Phase 3 — Education & Depth (upcoming)
- Educational micro-cards (Hunger / Fasting Science / Gut Health / Breathing)
- Yoga Kiosk: 12 core asanas with metabolic prescriptions
- Daily check-in + streak engine
- Weekly health score across 5 pillars
- Longitudinal blood test trend charts

### Phase 4 — Audio & Voice (upcoming)
- 268+ pre-recorded MP3 clips replacing Web Speech API
- Chethana voice persona (Vaidya recordings)

---

## Local Development

```bash
cp .env.local.example .env.local   # fill in Neon + Worker credentials
npm install
npm run db:migrate                  # apply Drizzle migrations to Neon
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment

Push to `main` → GitHub Actions → Cloudflare Pages (via OpenNext adapter).

Secrets required in Cloudflare Pages:
- `DATABASE_URL` — Neon connection string
- `NEON_AUTH_SECRET` — from Neon Auth dashboard
- `AI_WORKER_URL` — Cloudflare Worker URL
- `AI_WORKER_SECRET` — shared secret for Worker auth
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`

---

## Security Notes

- All DB queries go through `userScoped()` — row-level ownership enforced in app layer
- Gemini API key lives only in Cloudflare Worker secrets (`wrangler secret put`)
- `.env*` files are gitignored; never commit secrets
