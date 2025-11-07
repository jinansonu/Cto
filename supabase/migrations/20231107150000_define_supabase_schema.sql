create extension if not exists "pgcrypto";

create table if not exists public.user_profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    display_name text,
    avatar_url text,
    streak_count integer not null default 0 check (streak_count >= 0),
    last_active timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists user_profiles_last_active_idx on public.user_profiles (last_active desc);

create table if not exists public.interactions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    mode text not null check (mode in ('voice', 'text', 'camera')),
    summary text,
    metadata jsonb not null default '{}'::jsonb,
    occurred_at timestamptz not null default now(),
    created_at timestamptz not null default now()
);

create index if not exists interactions_user_id_idx on public.interactions (user_id);
create index if not exists interactions_user_id_occurred_at_idx on public.interactions (user_id, occurred_at desc);

create table if not exists public.insights (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    interaction_id uuid references public.interactions (id) on delete set null,
    title text,
    content text not null,
    tags text[] not null default '{}'::text[],
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists insights_user_id_idx on public.insights (user_id);
create index if not exists insights_interaction_id_idx on public.insights (interaction_id);

create table if not exists public.favorites (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    interaction_id uuid references public.interactions (id) on delete cascade,
    insight_id uuid references public.insights (id) on delete cascade,
    note text,
    created_at timestamptz not null default now(),
    constraint favorites_target_check check (
        ((interaction_id is not null)::int + (insight_id is not null)::int) = 1
    )
);

create index if not exists favorites_user_id_idx on public.favorites (user_id);
create unique index if not exists favorites_unique_user_interaction on public.favorites (user_id, interaction_id) where interaction_id is not null;
create unique index if not exists favorites_unique_user_insight on public.favorites (user_id, insight_id) where insight_id is not null;

create table if not exists public.user_settings (
    user_id uuid primary key references auth.users (id) on delete cascade,
    preferred_mode text not null default 'text' check (preferred_mode in ('voice', 'text', 'camera')),
    notifications_enabled boolean not null default true,
    timezone text not null default 'UTC',
    marketing_opt_in boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
    NEW.updated_at = now();
    return NEW;
end;
$$;

create trigger set_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.handle_updated_at();

create trigger set_insights_updated_at
before update on public.insights
for each row execute function public.handle_updated_at();

create trigger set_user_settings_updated_at
before update on public.user_settings
for each row execute function public.handle_updated_at();

create or replace function public.handle_interactions_after_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    new_occ timestamptz := coalesce(NEW.occurred_at, now());
    existing_streak integer;
    existing_last_active timestamptz;
    new_streak integer := 1;
    new_last_active timestamptz;
    existing_date date;
    new_date date := (new_occ at time zone 'utc')::date;
begin
    select streak_count, last_active
    into existing_streak, existing_last_active
    from public.user_profiles
    where id = NEW.user_id
    for update;

    if not found then
        insert into public.user_profiles (id, streak_count, last_active)
        values (NEW.user_id, 1, new_occ)
        on conflict (id) do update
            set last_active = excluded.last_active,
                streak_count = excluded.streak_count,
                updated_at = now();
    else
        if existing_last_active is null then
            new_streak := 1;
            new_last_active := new_occ;
        else
            existing_date := (existing_last_active at time zone 'utc')::date;

            if new_occ <= existing_last_active then
                new_streak := existing_streak;
                new_last_active := existing_last_active;
            elsif new_date = existing_date then
                new_streak := existing_streak;
                new_last_active := greatest(existing_last_active, new_occ);
            elsif new_date = existing_date + 1 then
                new_streak := existing_streak + 1;
                new_last_active := greatest(existing_last_active, new_occ);
            else
                new_streak := 1;
                new_last_active := new_occ;
            end if;
        end if;

        update public.user_profiles
        set streak_count = greatest(new_streak, 1),
            last_active = coalesce(new_last_active, new_occ),
            updated_at = now()
        where id = NEW.user_id;
    end if;

    return NEW;
end;
$$;

create trigger interactions_after_insert
after insert on public.interactions
for each row execute function public.handle_interactions_after_insert();

create or replace function public.create_defaults_for_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.user_profiles (id)
    values (NEW.id)
    on conflict (id) do nothing;

    insert into public.user_settings (user_id)
    values (NEW.id)
    on conflict (user_id) do nothing;

    return NEW;
end;
$$;

create trigger create_defaults_for_new_auth_user
after insert on auth.users
for each row execute function public.create_defaults_for_new_auth_user();
