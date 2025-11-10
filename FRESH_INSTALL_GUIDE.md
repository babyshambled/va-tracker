# 🔄 Fresh Install Guide - VA Tracker

## Step 1: Clean Slate

Run these commands in PowerShell:

```powershell
# Navigate to parent directory
cd "D:\Coding Projects\VA Tracker"

# Backup the old folder (in case you need anything)
Rename-Item "va-tracker-app" "va-tracker-app-backup"

# Create fresh Vite + React project
npm create vite@latest va-tracker-app -- --template react

# Navigate into new project
cd va-tracker-app

# Install base dependencies
npm install
```

## Step 2: Install Project Dependencies

```powershell
# Install main dependencies
npm install @supabase/supabase-js date-fns recharts

# Install dev dependencies
npm install -D tailwindcss postcss autoprefixer

# Initialize Tailwind
npx tailwindcss init -p
```

## Step 3: Copy Configuration Files

I'll provide updated versions of all config files. After you complete Step 2, let me know and I'll:

1. ✅ Update `tailwind.config.js`
2. ✅ Update `src/index.css` with Tailwind
3. ✅ Create `.env.local` for Supabase
4. ✅ Create `src/lib/supabaseClient.js`
5. ✅ Create folder structure
6. ✅ Copy over database schema
7. ✅ Copy over documentation

## Step 4: Start Development

```powershell
npm run dev
```

---

**Ready? Run Step 1 commands now, then tell me when you've completed Step 2!**
