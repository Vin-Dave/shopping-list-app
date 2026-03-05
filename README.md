# 🛒 Lista Zakupów — Shopping App

Responsywna aplikacja PWA do zarządzania listami zakupów.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Backend:** Supabase (Auth + PostgreSQL + RLS)
- **Hosting:** Netlify
- **PWA:** Vite PWA Plugin + Workbox

## Szybki Start

### 1. Baza danych (Supabase)

1. Wejdź w [Supabase Dashboard](https://supabase.com/dashboard)
2. Otwórz swój projekt → **SQL Editor**
3. Wklej zawartość `supabase/migration.sql` i uruchom (Run)

### 2. Instalacja lokalna

```bash
# Klonuj repo
git clone <twoje-repo-url>
cd shopping-app

# Zainstaluj zależności
npm install

# Uruchom dev server
npm run dev
```

Aplikacja będzie dostępna na `http://localhost:5173`

### 3. Deploy na Netlify

1. Pushuj kod na GitHub
2. Wejdź na [Netlify](https://app.netlify.com)
3. **Add new site** → **Import from Git** → wybierz repo
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. **Environment variables** — dodaj:
   - `VITE_SUPABASE_URL` = twój URL Supabase
   - `VITE_SUPABASE_ANON_KEY` = twój anon key
6. Deploy!

### 4. Konfiguracja Auth (Supabase)

W Supabase Dashboard → **Authentication** → **URL Configuration**:
- Site URL: `https://twoja-strona.netlify.app`
- Redirect URLs: `https://twoja-strona.netlify.app/**`

## Struktura Projektu

```
src/
├── components/
│   ├── auth/          # Logowanie, rejestracja
│   ├── layout/        # Layout, nawigacja
│   ├── stores/        # Komponenty sklepów
│   ├── lists/         # Komponenty list
│   └── common/        # Wspólne UI
├── hooks/
│   └── useAuth.tsx    # Auth hook + context
├── lib/
│   ├── supabase.ts    # Klient Supabase
│   └── database.types.ts  # TypeScript typy
├── pages/
│   ├── DashboardPage.tsx   # Grid sklepów
│   ├── StorePage.tsx       # Listy w sklepie
│   ├── ShoppingListPage.tsx # Lista zakupów
│   ├── HistoryPage.tsx     # Archiwum
│   └── TemplatesPage.tsx   # Szablony (Sprint 4)
├── App.tsx            # Routing
├── main.tsx           # Entry point
└── index.css          # Tailwind + custom styles
```

## Sprinty

- [x] **Sprint 1** — Scaffold, Auth, Schema, PWA
- [ ] **Sprint 2** — Core CRUD, Autocomplete
- [ ] **Sprint 3** — Offline, Drag & Drop
- [ ] **Sprint 4** — Szablony, Historia
- [ ] **Sprint 5** — Polish, Testy, Deploy
