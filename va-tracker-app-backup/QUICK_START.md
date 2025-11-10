# 🚀 Quick Start Guide

## ⚡ Installation (3 steps)

### Step 1: Install Dependencies
```bash
# Close VS Code first, then run:
cd "d:\Coding Projects\VA Tracker\va-tracker-app"
npm install
```

### Step 2: Configure Supabase
1. Go to [supabase.com](https://supabase.com) → Create project
2. Copy your Project URL and Anon Key from Settings → API
3. Paste them into `.env.local`:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### Step 3: Set Up Database
1. Open Supabase SQL Editor
2. Copy/paste contents of `DATABASE_SCHEMA.sql`
3. Run the query

## ✅ Verify Setup

```bash
npm run dev
```

Should open `http://localhost:5173` with no errors.

## 📋 What's Installed

✅ React 19 + Vite (fast dev server)
✅ Tailwind CSS (utility-first styling)
✅ Supabase client (database + auth)
✅ date-fns (date utilities)
✅ Recharts (analytics charts)
✅ react-pdf/renderer (invoice generation)

## 🎯 Next: Start Building

Now you're ready to start Phase 1!

### Phase 1: Activity Tracking
Migrate the existing HTML tracker to React + Supabase.

**Files to create:**
- `src/components/ActivityTracker.jsx`
- `src/components/WeekCalendar.jsx`
- `src/pages/Dashboard.jsx`
- `src/hooks/useActivities.js`

**Start here:**
```jsx
// src/App.jsx
import { supabase } from './lib/supabaseClient'

function App() {
  // Check Supabase connection
  console.log('Supabase:', supabase)

  return <div>Hello VA Tracker!</div>
}

export default App
```

## 🐛 Troubleshooting

**"npm install" fails with EBUSY?**
→ Close VS Code and all terminals, then retry

**Dev server won't start?**
→ Check that port 5173 isn't already in use

**Supabase connection error?**
→ Verify `.env.local` has correct URL/key (no spaces)

**Still stuck?**
→ Check `SETUP_INSTRUCTIONS.md` for detailed help

---

**Ready? Run `npm install` and let's go! 🚀**
