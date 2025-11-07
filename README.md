# Cto

This project uses Supabase to manage authentication-linked profiles, user interactions, insights, favorites, and settings. The SQL schema is defined in `supabase/migrations` and the generated TypeScript types live in `types/supabase.ts`.

## Database overview

- **public.user_profiles** — Extends `auth.users` with profile details (`display_name`, `avatar_url`) and engagement metrics (`streak_count`, `last_active`).
- **public.interactions** — Records every interaction a user has with the product, including the interaction `mode` (voice, text, or camera) and associated metadata.
- **public.insights** — Stores insights derived from interactions. Insights are linked back to both the originating interaction and the user.
- **public.favorites** — Tracks user favourites across insights and interactions with constraints ensuring a single target per row.
- **public.user_settings** — Persists per-user preferences such as mode defaults and notification flags. Defaults are inserted automatically for new auth users.

Triggers keep profile `last_active` and `streak_count` in sync whenever interactions are created, and default profile/settings rows are created when new auth accounts are provisioned.

## Running migrations locally

1. Install the Supabase CLI if you do not already have it:
   ```bash
   npm install -g supabase
   ```
2. Authenticate and link the CLI to your Supabase project (skip linking for local dev-only work):
   ```bash
   supabase login
   supabase link --project-ref <project-ref>
   ```
3. Bring up the local Supabase stack and apply the migrations:
   ```bash
   supabase start      # starts the local Supabase containers
   supabase db reset   # resets and applies all migrations locally
   # alternatively, to push only pending migrations without a reset:
   supabase db push
   ```

## Updating generated types

Regenerate the `types/supabase.ts` file whenever the database schema changes:

```bash
supabase gen types typescript --linked > types/supabase.ts
```

If you are working purely against the local development database, replace `--linked` with `--project-id local` in the command above.
