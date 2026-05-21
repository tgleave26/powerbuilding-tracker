# Powerbuilding Tracker

A 6-week push/pull/legs powerbuilding tracker built with React + Supabase + Vite.

---

## Step 1: Create the Supabase table

In your Supabase dashboard, go to **SQL Editor** and run this:

```sql
CREATE TABLE workout_logs (
  id SERIAL PRIMARY KEY,
  log_key TEXT UNIQUE NOT NULL,
  weight TEXT,
  reps TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Step 2: Add your Supabase credentials

Create a `.env` file in the root of the project:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_KEY=your-anon-public-key
```

To find these, go to your Supabase dashboard → **Project Settings** → **API**:
- **Project URL** → paste as `VITE_SUPABASE_URL`
- **anon public** key → paste as `VITE_SUPABASE_KEY`

---

## Step 3: Install and run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Step 4: Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to vercel.com → New Project → Import your repo
3. Framework preset: **Vite**
4. Add the same two environment variables from Step 2 under **Environment Variables**
5. Click Deploy — done!

---

## Features

- 6-week progressive overload program (Hypertrophy → Strength-Hypertrophy → Peaking)
- 6 training days: Legs 1, Push 1, Pull 1, Legs 2, Push 2, Pull 2
- Heavy top set + 3 back-off working sets for main lifts
- RPE targets for all accessories
- Add Set button on every exercise
- Rest timer: 90s or 3 min
- All sets logged to Supabase (syncs across devices)
- Previous weight shown on each set
- Analytics page with PR detection and progress charts
