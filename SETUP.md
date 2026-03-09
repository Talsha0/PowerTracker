# PowerTracker — Setup & Deployment Guide

## 1. Prerequisites

- Node.js 18+
- npm / yarn / pnpm
- Supabase account (free tier)
- Vercel account (free tier)

---

## 2. Supabase Setup

### 2.1 Create Project

1. Go to https://supabase.com and create a new project
2. Note your **Project URL** and **anon public key** (Settings → API)

### 2.2 Run Database Schema

Open **SQL Editor** in Supabase dashboard and run in order:

```
1. supabase/schema.sql       — creates all tables, indexes, triggers, seeds
2. supabase/rls-policies.sql — enables RLS and creates all security policies
3. supabase/storage-setup.sql — creates storage buckets for avatars/images
```

### 2.3 Configure Authentication

In Supabase dashboard → Authentication → Settings:
- Enable **Email** provider
- Set **Site URL** to your production URL (e.g. `https://powertracker.vercel.app`)
- Add redirect URLs:
  - `https://powertracker.vercel.app/**`
  - `http://localhost:3000/**` (for development)

---

## 3. Local Development

### 3.1 Install dependencies

```bash
npm install
```

### 3.2 Environment variables

Copy `.env.local.example` to `.env.local` and fill in values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3.3 Run dev server

```bash
npm run dev
```

Open `http://localhost:3000`

---

## 4. Generate PWA Icons

You need to generate icons in required sizes. Use any icon generator:

**Option A — Online tool:**
Visit https://realfavicongenerator.net and upload a 512×512 PNG

**Option B — Using sharp (Node):**
```bash
npm install -g sharp-cli
sharp -i icon-source.png -o public/icons/icon-72.png resize 72
sharp -i icon-source.png -o public/icons/icon-96.png resize 96
sharp -i icon-source.png -o public/icons/icon-128.png resize 128
sharp -i icon-source.png -o public/icons/icon-144.png resize 144
sharp -i icon-source.png -o public/icons/icon-152.png resize 152
sharp -i icon-source.png -o public/icons/icon-192.png resize 192
sharp -i icon-source.png -o public/icons/icon-384.png resize 384
sharp -i icon-source.png -o public/icons/icon-512.png resize 512
sharp -i icon-source.png -o public/icons/apple-touch-icon.png resize 180
```

Place all icon files in `public/icons/`.

---

## 5. Deploy to Vercel

### 5.1 Push to GitHub

```bash
git add .
git commit -m "feat: initial PowerTracker PWA"
git remote add origin https://github.com/yourusername/powertracker.git
git push -u origin main
```

### 5.2 Deploy

1. Go to https://vercel.com and import your GitHub repository
2. Framework: **Next.js** (auto-detected)
3. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**

### 5.3 Update Supabase redirect URLs

After deployment, add your Vercel URL to Supabase Auth redirect URLs.

---

## 6. Install on Mobile (PWA)

### iPhone (Safari):
1. Open the app URL in Safari
2. Tap the **Share** button (rectangle with arrow up)__dirname
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **Add** — the app icon appears on your home screen

### Android (Chrome):
1. Open the app URL in Chrome
2. Tap the **install prompt** that appears at the bottom
   OR tap the 3-dot menu → **"Add to Home Screen"**

---

## 7. Project Structure

```
PowerTracker/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Login / Register pages
│   │   ├── login/
│   │   └── register/
│   ├── (app)/              # Protected app pages
│   │   ├── dashboard/      # Home dashboard
│   │   ├── workout/
│   │   │   ├── new/        # Create workout
│   │   │   └── [id]/       # Workout detail
│   │   ├── analytics/      # Stats & charts
│   │   ├── social/         # Friends & feed
│   │   │   └── leaderboard/
│   │   ├── calendar/       # Calendar view
│   │   └── profile/        # User profile & goals
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ai/                 # AI Coach widget
│   ├── analytics/          # Charts & stats
│   ├── calendar/           # Calendar
│   ├── layout/             # Header, BottomNav
│   ├── providers/          # React Query provider
│   ├── pwa/                # PWA install prompt, SW registration
│   ├── social/             # Friend cards, comments
│   ├── ui/                 # Base UI components
│   └── workout/            # Workout-specific components
├── constants/
│   └── text.ts             # ALL Hebrew UI text
├── hooks/
│   ├── useAuth.ts
│   ├── useAutoSave.ts
│   ├── useInstallPrompt.ts
│   └── useOfflineSync.ts
├── lib/supabase/           # Supabase clients
├── services/               # API service layer
├── store/                  # Zustand stores
├── supabase/               # SQL files
├── types/                  # TypeScript types
├── utils/                  # Utilities
└── public/
    ├── manifest.json
    ├── sw.js               # Service Worker
    └── icons/              # PWA icons
```

---

## 8. Architecture Notes

### RTL Support
- `<html dir="rtl" lang="he">` set in root layout
- All components use `text-right` by default
- CSS `direction: rtl` set globally

### Autosave
- Saves draft to Supabase every 15 seconds
- Also saves on tab hide and before unload
- Draft stored in Zustand (persisted to localStorage) + Supabase
- On reload, draft is restored from localStorage first, then synced with Supabase

### Offline Support
- Service worker caches static assets
- Draft workouts stored in localStorage/Zustand
- IndexedDB queue for pending actions
- Auto-syncs when connection returns

### AI Coach
- Currently rule-based (see `utils/aiCoach.ts`)
- Architecture allows drop-in replacement with OpenAI API
- To add OpenAI: create `services/openai.service.ts` and call from `CoachWidget`
