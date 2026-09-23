# EduVerse Frontend

React 18 (plain `.jsx`, no TypeScript) · Vite · React Router 6 · Tailwind CSS 3 ·
Axios · lucide-react icons.

This was converted from a TypeScript/shadcn-ui starter into a lean, dependency-light
JSX component kit (`src/components/ui/*`) that keeps the same visual language
(CSS variable design tokens in `src/index.css` + `tailwind.config.js`) without
requiring Radix UI or a TypeScript toolchain.

## Structure

```
src/
├── api/            One file per backend resource area (axios calls only)
├── components/
│   ├── ui/         Design-system primitives (button, card, input, table, dialog…)
│   ├── layout/      Sidebar, Header, DashboardLayout, role-based nav-data.js
│   ├── shared/      StatCard, PageHeader, EmptyState, Spinner, StatusBadge
│   └── auth/        ProtectedRoute (role + auth gate)
├── context/         AuthContext (login/session), ToastContext (notifications)
├── pages/
│   ├── auth/        Login, ChangePassword
│   ├── master/       Master Admin dashboard + Institutions management
│   ├── superadmin/  Super Admin dashboard, Admins management, Settings
│   ├── admin/       Admin dashboard, Faculty Attendance overview
│   ├── shared/       Classes, Students, Faculty, Fees, Announcements
│   │                 (used by BOTH Admin and Super Admin — same API access)
│   ├── faculty/      Faculty dashboard, Mark Attendance, My Attendance
│   ├── student/      Student dashboard, My Attendance, My Fees
│   └── parent/       Parent dashboard, Children (attendance/fees per child)
├── App.jsx          All routes, grouped by role, each behind <ProtectedRoute>
└── main.jsx         Entry point (BrowserRouter + AuthProvider + ToastProvider)
```

## Running locally

```bash
npm install
npm run dev
```

Requests to `/api/*` are proxied to `http://localhost:8080` in dev (see
`vite.config.js`). For a production build pointed at a different API host, set:

```bash
VITE_API_URL=https://your-api.example.com/api npm run build
```

## Auth & routing

- `AuthContext` stores `accessToken` / `refreshToken` / `user` in `localStorage`
  and exposes `login()`, `logout()`, `refreshCurrentUser()`.
- `src/api/client.js` is a shared axios instance: it attaches the bearer token
  to every request and, on a 401, transparently refreshes the token once and
  retries the original request before giving up and redirecting to `/login`.
- `ProtectedRoute` checks both "is logged in" and "has one of the allowed
  roles", redirecting to that role's home page (`ROLE_HOME` in
  `components/layout/nav-data.js`) if not.

## Adding a new page

1. Add an API module (or extend an existing one) in `src/api/`.
2. Build the page in the right `src/pages/<role>/` folder, reusing the
   `src/components/ui` and `src/components/shared` primitives.
3. Register the route in `App.jsx` under the right role-gated `<Route>` group.
4. If it needs a sidebar link, add it to `NAV_BY_ROLE` in
   `src/components/layout/nav-data.js`.
