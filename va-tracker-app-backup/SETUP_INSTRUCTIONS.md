# VA Tracker App - Setup Instructions

## 🚀 Quick Start

### 1. Install Dependencies

**IMPORTANT:** Close all VS Code windows for this project first to avoid file locking issues on Windows.

Then run:
```bash
cd "d:\Coding Projects\VA Tracker\va-tracker-app"
npm install
```

This will install:
- React 19 + Vite
- Supabase client
- Tailwind CSS
- date-fns (date utilities)
- Recharts (for analytics charts)
- react-pdf/renderer (for invoice generation)

### 2. Configure Supabase

1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project (name it something like "va-tracker-prod")
3. Once created, go to **Settings > API**
4. Copy your:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJhbGc...`)

5. Open `.env.local` in this project and replace the placeholders:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your-actual-key
```

### 3. Set Up Database

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Create a new query
4. Copy and paste the database schema (see `DATABASE_SCHEMA.sql` - we'll create this next)
5. Run the query

### 4. Start Development Server

```bash
npm run dev
```

This will start the Vite dev server at `http://localhost:5173`

## 📁 Project Structure

```
va-tracker-app/
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/          # Main page components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions and configs
│   │   └── supabaseClient.js  # Supabase configuration
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # App entry point
│   └── index.css       # Global styles (Tailwind)
├── .env.local          # Environment variables (DO NOT COMMIT)
├── tailwind.config.js  # Tailwind configuration
└── vite.config.js      # Vite configuration
```

## 🎨 Tech Stack

- **Frontend:** React 19 + Vite
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Google OAuth)
- **Charts:** Recharts
- **PDF Generation:** react-pdf/renderer
- **Date Handling:** date-fns

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## 🔒 Security Notes

- Never commit `.env.local` to git (already in `.gitignore`)
- Keep your Supabase service role key secret (not used in frontend)
- The anon key is safe to use in frontend code (protected by RLS policies)

## 🐛 Troubleshooting

### File Locking Issues (Windows)
If `npm install` fails with "EBUSY" errors:
1. Close all VS Code windows
2. Close any terminals running the dev server
3. Try again

### Supabase Connection Issues
Check that:
1. Your `.env.local` has the correct URL and key
2. There are no extra spaces or quotes around the values
3. You've restarted the dev server after changing `.env.local`

## 📚 Next Steps

1. ✅ Install dependencies (`npm install`)
2. ✅ Configure Supabase credentials
3. ⬜ Set up database schema
4. ⬜ Enable Google OAuth in Supabase
5. ⬜ Start building Phase 1 (Activity Tracking)

## 🎯 Development Phases

- **Phase 1:** Migrate existing HTML tracker to React + Supabase
- **Phase 2:** Add time tracking system
- **Phase 3:** Build approval workflow
- **Phase 4:** Implement invoice generation
- **Phase 5:** Integrate Claude AI coaching
- **Phase 6:** Add performance analytics
- **Phase 7:** Polish and deploy

---

**Ready to start? Run `npm install` and let's build! 🚀**
