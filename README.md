# cto.new Next.js App

This project is a Next.js application that integrates Supabase authentication and storage. It provides:

- Email/password authentication with sign-in, sign-up, and password reset flows
- Client and server Supabase helpers for React components, route handlers, and middleware
- An authenticated dashboard with optimistic profile editing (display name + avatar upload)
- Auth-aware navigation guarded by middleware-based redirects
- Tailwind CSS powered UI components for the auth and profile experiences

## Getting started

1. Install dependencies

```bash
pnpm install
# or
npm install
```

2. Create a `.env.local` file and configure the required Supabase environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

> The service role key is only needed for scripts or server-side utilities. Route handlers use cookie-based authentication and the anon key.

3. Run the development server

```bash
pnpm dev
# or
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Project structure

- `app/` – Next.js app router pages, including API route handlers
  - `auth/` – authentication screens (sign-in, sign-up, reset password)
  - `profile/` – authenticated profile management UI
  - `api/profile` – REST endpoints for profile fetching, updating, and avatar uploads
- `components/` – shared UI and provider components
- `lib/supabase/` – Supabase client factories for browser and server runtimes
- `middleware.ts` – Auth-aware routing middleware

## Tailwind CSS

Tailwind is configured under `tailwind.config.js` and loaded globally via `app/globals.css`. Update these files to adjust theme tokens, colors, or design scales.

## Authentication flow overview

1. The `AuthProvider` wraps the application to expose session, user, and profile state.
2. Browser components use the Supabase browser client (`lib/supabase/client`) to sign in, sign up, and manage sessions.
3. API route handlers and middleware use the server client (`lib/supabase/server`) to validate the current session and access protected tables/storage.
4. Middleware guards protected routes (`/` and `/profile`), redirecting unauthenticated users to `/auth`.
5. After successful authentication, the profile screen supports optimistic updates for display name changes and avatar uploads to Supabase Storage.

## Storage bucket setup

Create a Supabase storage bucket named `avatars` with “public” policies so uploaded avatars can be fetched from the client. The profile update API expects this bucket when saving avatar files.

## Linting

Run `npm run lint` (or `pnpm lint`) to execute ESLint with the Next.js configuration.
