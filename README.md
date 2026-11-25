# Dialoguers — website

The site for **Dialoguers**: long-form conversations (video on YouTube, audio optional) organised by people, themes and place, with a 3D topic-cloud map as the landing page.

- **Framework:** Next.js 16 (App Router, Cache Components), React 19, TypeScript
- **Content:** Sanity, with the editor ("Studio") built into the site at `/studio`
- **Hosting:** Vercel (free Hobby plan is enough to start)
- **Media:** YouTube IDs stored per conversation; optional audio URL from a podcast host

The site runs **before Sanity is connected**: with no Sanity project ID it uses the sample content in `src/content/seed.json`. The sample people and conversations are fictional placeholders.

---

## Run it locally

Needs **Node.js 24 (LTS)**: `nvm install 24 && nvm use` (reads `.nvmrc`), or `brew install node@24`.

```bash
cd path/to/site              # the folder with package.json in it
npm install
cp .env.example .env.local   # leave values empty to use the sample content
npm run dev
```

Wait for `✓ Ready`, then open **http://localhost:3000** in your browser. The dev server keeps running in that terminal window; run other commands in a new tab, and press **Ctrl+C** to stop it (Ctrl+Z only pauses it and keeps port 3000 busy; if that happens, run `kill %1`).

`npm run build && npm start` runs the production build (stop the dev server first).

## Project map

| Path | What it is |
|---|---|
| `src/app/(site)/` | All public pages: `/` (map), `/conversations`, `/conversations/[slug]`, `/themes`, `/people`, `/notes`, `/about` |
| `src/app/studio/` | The Sanity Studio (content editor) at `/studio` |
| `src/app/api/revalidate/` | Webhook Sanity calls on publish so changes go live within seconds |
| `src/components/map/engine.js` | The 3D constellation + geography map (plain SVG/DOM, no 3D library) |
| `src/components/Player.tsx` | YouTube / audio player with chapter jumps and a synced, searchable transcript |
| `src/lib/content.ts` | One cached query that loads all content (Sanity, or the sample content) |
| `src/sanity/schemaTypes/` | Content model: Conversation, Person, Theme, Field Note, Site settings |
| `seed/dialoguers.ndjson` | Sample content ready to import into Sanity (`npm run seed:build` regenerates it) |

## Content model (what Kris edits in /studio)

- **Site settings** — headline, intro paragraph, host name, featured conversation, contact email.
- **Conversation** — title, date, format, guests, themes, tags, questions explored; **YouTube video ID** and/or audio URL; chapters and transcript (times like `12:30`; leave speaker empty for the host).
- **Person** — name, role, field, city, region, **map location**, themes (the **first theme decides which topic cloud** they sit in), **manual connections** to other people (drawn on the map as solid lines, in addition to dotted shared-theme lines), bio, photo (only with a signed release).
- **Theme** — name, short name, tagline, blurb, three colours, subtopics, pull quote, and **order** (position on the map ring).
- **Field Note** — the essay layout: at a glance, nutrition guide, big picture, insights, takeaway, closing section, related conversations.

---

## Setup checklist (one time)

### 1. GitHub
1. Create a free GitHub **organization** for the project (e.g. `dialoguers`) under your personal account. Keep the other project in its own org.
2. Create a repo in it (e.g. `site`). Make it **public**: Vercel's free plan won't deploy *private* repos owned by an organization. The LICENSE keeps it all-rights-reserved.
3. Push this code:
   ```bash
   git init && git add -A && git commit -m "Dialoguers site"
   git branch -M main
   git remote add origin https://github.com/<org>/<repo>.git
   git push -u origin main
   ```

### 2. Sanity
1. Sign in at sanity.io → **Create project** ("Dialoguers"), dataset **production**. Copy the **Project ID**.
2. In the project's **API → CORS origins**, add (with *Allow credentials* on): `http://localhost:3000`, your Vercel URL (`https://<project>.vercel.app`) and later your domain.
3. **Members → Invite** Kris as *Editor* (free plan includes enough seats).
4. Put the Project ID in `.env.local` (`NEXT_PUBLIC_SANITY_PROJECT_ID=...`).
5. Optional — load the sample content to see everything working, then replace it:
   ```bash
   npx sanity login
   npm run seed:import
   ```
   Delete the sample people/conversations before launch (they're fictional).

### 3. Vercel
1. Sign in to Vercel with GitHub → **Add New Project** → import the repo (framework: Next.js; no other settings needed).
2. Add the environment variables from `.env.example` (Project ID, dataset, a long random `SANITY_REVALIDATE_SECRET`, `NEXT_PUBLIC_SITE_URL`).
3. Deploy. Every push to `main` deploys; every branch gets its own preview link.

### 4. Publish = live (webhook)
In Sanity → **API → Webhooks → Create**:
- URL: `https://<your-domain>/api/revalidate`
- Trigger on: Create, Update, Delete
- Filter: `_type in ["conversation","person","theme","fieldNote","siteSettings"]`
- HTTP method: POST, Secret: the same `SANITY_REVALIDATE_SECRET`

Without the webhook, changes still appear within a few hours (the cache refreshes on its own).

### 5. Domain (Porkbun)
1. Buy the domain at Porkbun.
2. In Vercel → Project → **Domains**, add it. Vercel shows the exact DNS records to create.
3. Add those records in Porkbun → Domain → **DNS**. HTTPS is automatic once they resolve.
4. Add the domain to Sanity's CORS origins and set `NEXT_PUBLIC_SITE_URL`.

---

## Publishing a conversation

1. Upload the video to YouTube (public or unlisted). Copy the ID — the part after `v=`.
2. In `/studio`: add any new guests under **People** (with map location and themes).
3. **Conversations → New**: title, date, guests, themes, paste the YouTube ID, add chapters and the transcript.
4. **Publish.** With the webhook set up, it's live in seconds.

## Not done yet

- **Newsletter:** forms are placeholders; connect a provider (Buttondown, Beehiiv, Substack) in `src/components/Newsletter.tsx` and `NewsletterBox.tsx`.
- **Analytics:** e.g. Vercel Web Analytics (one toggle in Vercel).
- **Social images:** per-conversation preview images for links shared on social.
- **Copy:** About page text and the host name (from the mockups) are placeholders; the host fields are in Site settings.
- **Transcript import:** transcripts are entered line by line; a paste-and-split importer would save time once real transcripts exist.

## License

All rights reserved — see `LICENSE`.
