-- Neara production schema
-- Core rule: one shared adult network; discovery preferences are private to the viewer.
-- Exact GPS coordinates are intentionally not stored.

create extension if not exists pgcrypto with schema extensions;

create type public.neara_gender as enum ('woman', 'man', 'nonbinary', 'other', 'prefer_not_to_say');
create type public.neara_visibility as enum ('visible', 'ghost', 'invisible_until_match', 'paused', 'travel');
create type public.neara_signal_status as enum ('pending', 'accepted', 'declined', 'expired', 'cancelled', 'blocked');

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 32),
  birth_date date not null,
  gender public.neara_gender not null,
  bio text not null default '' check (char_length(bio) <= 500),
  interests text[] not null default '{}',
  intent text not null default 'open_to_chat',
  vibe text not null default 'open_to_chat',
  verified boolean not null default false,
  premium boolean not null default false,
  visibility public.neara_visibility not null default 'visible',
  privacy_radius text not null default 'standard' check (privacy_radius in ('standard','private','extra_private')),
  trust_badge boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (birth_date <= current_date - interval '18 years')
);

comment on table public.profiles is 'Public-facing Neara profile. Discovery/orientation preferences must never be stored here.';

create table public.discovery_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  genders public.neara_gender[] not null default '{}',
  age_min smallint not null default 18 check (age_min between 18 and 99),
  age_max smallint not null default 70 check (age_max between 18 and 120),
  zone_radius smallint not null default 2 check (zone_radius between 1 and 4),
  intents text[] not null default '{}',
  interests text[] not null default '{}',
  vibes text[] not null default '{}',
  verified_only boolean not null default false,
  expand_if_quiet boolean not null default true,
  updated_at timestamptz not null default now(),
  check (age_min <= age_max)
);

comment on table public.discovery_preferences is 'Private viewer-only map lens. Never use this table to partition the Neara network or determine another user''s map.';

create table public.presence (
  user_id uuid primary key references auth.users(id) on delete cascade,
  zone_id text not null,
  display_lat numeric(8,5) not null check (display_lat between -90 and 90),
  display_lng numeric(8,5) not null check (display_lng between -180 and 180),
  active_until timestamptz not null,
  updated_at timestamptz not null default now()
);

comment on table public.presence is 'Approximate display location only. Clients must randomize/bucket coordinates before writing; exact GPS must not be persisted.';

create table public.profile_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  sort_order smallint not null default 0,
  is_private boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, storage_path)
);

create table public.signals (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  message text check (char_length(message) <= 280),
  status public.neara_signal_status not null default 'pending',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  check (sender_id <> recipient_id)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references auth.users(id) on delete cascade,
  user_b uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  closed_at timestamptz,
  check (user_a <> user_b),
  unique (user_a, user_b)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  message_type text not null default 'text',
  created_at timestamptz not null default now()
);

create table public.blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_id uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  detail text check (char_length(detail) <= 2000),
  created_at timestamptz not null default now(),
  check (reporter_id <> target_id)
);

create index profiles_visibility_idx on public.profiles (visibility, updated_at desc);
create index presence_active_idx on public.presence (active_until desc, zone_id);
create index signals_recipient_idx on public.signals (recipient_id, status, created_at desc);
create index signals_sender_idx on public.signals (sender_id, created_at desc);
create index matches_a_idx on public.matches (user_a, created_at desc);
create index matches_b_idx on public.matches (user_b, created_at desc);
create index messages_match_idx on public.messages (match_id, created_at);
create index blocks_blocked_idx on public.blocks (blocked_id);

alter table public.profiles enable row level security;
alter table public.discovery_preferences enable row level security;
alter table public.presence enable row level security;
alter table public.profile_photos enable row level security;
alter table public.signals enable row level security;
alter table public.matches enable row level security;
alter table public.messages enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;

-- Profiles: every signed-in adult shares one network. The DB does not apply sexual-orientation partitions.
create policy profiles_read_shared_network
on public.profiles for select
to authenticated
using (
  visibility in ('visible','ghost','travel')
  and not exists (
    select 1 from public.blocks b
    where (b.blocker_id = (select auth.uid()) and b.blocked_id = profiles.user_id)
       or (b.blocker_id = profiles.user_id and b.blocked_id = (select auth.uid()))
  )
);

create policy profiles_insert_self
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy profiles_update_self
on public.profiles for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- Discovery preferences are strictly private to the account owner.
create policy discovery_preferences_select_self
on public.discovery_preferences for select
to authenticated
using ((select auth.uid()) = user_id);

create policy discovery_preferences_insert_self
on public.discovery_preferences for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy discovery_preferences_update_self
on public.discovery_preferences for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- Presence is readable as approximate map data for the shared network.
create policy presence_read_active_shared_network
on public.presence for select
to authenticated
using (
  active_until > now()
  and not exists (
    select 1 from public.blocks b
    where (b.blocker_id = (select auth.uid()) and b.blocked_id = presence.user_id)
       or (b.blocker_id = presence.user_id and b.blocked_id = (select auth.uid()))
  )
);

create policy presence_insert_self
on public.presence for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy presence_update_self
on public.presence for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy presence_delete_self
on public.presence for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Public photos are shared; private photos are owner-only until explicit album grants are added.
create policy photos_read_public_or_self
on public.profile_photos for select
to authenticated
using (not is_private or (select auth.uid()) = user_id);

create policy photos_manage_self_insert
on public.profile_photos for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy photos_manage_self_update
on public.profile_photos for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy photos_manage_self_delete
on public.profile_photos for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy signals_read_participants
on public.signals for select
to authenticated
using ((select auth.uid()) in (sender_id, recipient_id));

create policy signals_send_self
on public.signals for insert
to authenticated
with check (
  (select auth.uid()) = sender_id
  and not exists (
    select 1 from public.blocks b
    where (b.blocker_id = sender_id and b.blocked_id = recipient_id)
       or (b.blocker_id = recipient_id and b.blocked_id = sender_id)
  )
);

create policy signals_update_recipient_or_sender
on public.signals for update
to authenticated
using ((select auth.uid()) in (sender_id, recipient_id))
with check ((select auth.uid()) in (sender_id, recipient_id));

create policy matches_read_members
on public.matches for select
to authenticated
using ((select auth.uid()) in (user_a, user_b));

create policy matches_insert_member
on public.matches for insert
to authenticated
with check ((select auth.uid()) in (user_a, user_b));

create policy matches_update_members
on public.matches for update
to authenticated
using ((select auth.uid()) in (user_a, user_b))
with check ((select auth.uid()) in (user_a, user_b));

create policy messages_read_match_members
on public.messages for select
to authenticated
using (
  exists (
    select 1 from public.matches m
    where m.id = messages.match_id
      and (select auth.uid()) in (m.user_a, m.user_b)
  )
);

create policy messages_send_as_self_to_match
on public.messages for insert
to authenticated
with check (
  (select auth.uid()) = sender_id
  and exists (
    select 1 from public.matches m
    where m.id = messages.match_id
      and (select auth.uid()) in (m.user_a, m.user_b)
      and m.closed_at is null
  )
);

create policy blocks_read_self
on public.blocks for select
to authenticated
using ((select auth.uid()) = blocker_id);

create policy blocks_insert_self
on public.blocks for insert
to authenticated
with check ((select auth.uid()) = blocker_id);

create policy blocks_delete_self
on public.blocks for delete
to authenticated
using ((select auth.uid()) = blocker_id);

create policy reports_read_self
on public.reports for select
to authenticated
using ((select auth.uid()) = reporter_id);

create policy reports_insert_self
on public.reports for insert
to authenticated
with check ((select auth.uid()) = reporter_id);

-- Realtime publication: presence, signals, matches, and messages are the live surfaces.
alter publication supabase_realtime add table public.presence;
alter publication supabase_realtime add table public.signals;
alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.messages;
