-- Neara production schema
-- Product invariant: ONE adult network. Discovery preferences are a private viewer lens only.
-- Privacy invariant: exact GPS coordinates and exact birth dates are not stored in public profile tables.

create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;
revoke all on schema private from public, anon;

do $$ begin
  create type public.neara_gender as enum ('woman', 'man', 'nonbinary', 'other', 'prefer_not_to_say');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.neara_visibility as enum ('visible', 'ghost', 'invisible_until_match', 'paused', 'travel');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.neara_signal_status as enum ('pending', 'accepted', 'declined', 'expired', 'cancelled', 'blocked');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 32),
  age smallint not null check (age between 18 and 120),
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
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Public-facing Neara profile. Never store orientation/discovery preferences or exact birth date here.';

create table if not exists public.discovery_preferences (
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

comment on table public.discovery_preferences is
  'Private viewer-only map lens. It must never partition Neara or determine another person''s map.';

create table if not exists public.presence (
  user_id uuid primary key references auth.users(id) on delete cascade,
  zone_id text not null,
  -- Approximate/jittered display coordinates only. Never exact GPS.
  display_lat numeric(8,5) not null check (display_lat between -90 and 90),
  display_lng numeric(8,5) not null check (display_lng between -180 and 180),
  active_until timestamptz not null,
  updated_at timestamptz not null default now()
);

comment on table public.presence is
  'Approximate display location only. The client must jitter/bucket before writing; exact GPS is never persisted.';

create table if not exists public.profile_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  sort_order smallint not null default 0,
  is_private boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, storage_path)
);

create table if not exists public.signals (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  message text check (char_length(message) <= 280),
  status public.neara_signal_status not null default 'pending',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  check (sender_id <> recipient_id)
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references auth.users(id) on delete cascade,
  user_b uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  closed_at timestamptz,
  check (user_a <> user_b)
);

create unique index if not exists matches_pair_unique_idx
  on public.matches (least(user_a, user_b), greatest(user_a, user_b));

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  message_type text not null default 'text',
  created_at timestamptz not null default now()
);

create table if not exists public.blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table if not exists public.private_album_grants (
  owner_id uuid not null references auth.users(id) on delete cascade,
  viewer_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  primary key (owner_id, viewer_id),
  check (owner_id <> viewer_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_id uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  detail text check (char_length(detail) <= 2000),
  created_at timestamptz not null default now(),
  check (reporter_id <> target_id)
);

create index if not exists profiles_visibility_idx on public.profiles (visibility, updated_at desc);
create index if not exists presence_active_idx on public.presence (active_until desc, zone_id);
create index if not exists signals_recipient_idx on public.signals (recipient_id, status, created_at desc);
create index if not exists signals_sender_idx on public.signals (sender_id, created_at desc);
create index if not exists matches_a_idx on public.matches (user_a, created_at desc);
create index if not exists matches_b_idx on public.matches (user_b, created_at desc);
create index if not exists messages_match_idx on public.messages (match_id, created_at);
create index if not exists blocks_blocked_idx on public.blocks (blocked_id);
create index if not exists album_grants_viewer_idx on public.private_album_grants (viewer_id) where revoked_at is null;

alter table public.profiles enable row level security;
alter table public.discovery_preferences enable row level security;
alter table public.presence enable row level security;
alter table public.profile_photos enable row level security;
alter table public.signals enable row level security;
alter table public.matches enable row level security;
alter table public.messages enable row level security;
alter table public.blocks enable row level security;
alter table public.private_album_grants enable row level security;
alter table public.reports enable row level security;

-- Private helper: evaluates both directions without exposing who blocked whom.
create or replace function private.is_blocked_pair(target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when auth.uid() is null then true
    else exists (
      select 1
      from public.blocks b
      where (b.blocker_id = auth.uid() and b.blocked_id = target)
         or (b.blocker_id = target and b.blocked_id = auth.uid())
    )
  end;
$$;
revoke all on function private.is_blocked_pair(uuid) from public, anon;
grant execute on function private.is_blocked_pair(uuid) to authenticated;

create or replace function private.can_view_private_album(owner uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when auth.uid() is null then false
    when auth.uid() = owner then true
    else
      not private.is_blocked_pair(owner)
      and exists (
        select 1
        from public.private_album_grants g
        where g.owner_id = owner
          and g.viewer_id = auth.uid()
          and g.revoked_at is null
      )
      and exists (
        select 1
        from public.matches m
        where m.closed_at is null
          and ((m.user_a = owner and m.user_b = auth.uid())
            or (m.user_b = owner and m.user_a = auth.uid()))
      )
  end;
$$;
revoke all on function private.can_view_private_album(uuid) from public, anon;
grant execute on function private.can_view_private_album(uuid) to authenticated;

-- Shared network: no orientation partition exists in database access rules.
drop policy if exists profiles_read_shared_network on public.profiles;
create policy profiles_read_shared_network
on public.profiles for select
to authenticated
using (
  user_id = (select auth.uid())
  or (
    visibility in ('visible','travel')
    and not private.is_blocked_pair(user_id)
  )
);

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self
on public.profiles for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists profiles_delete_self on public.profiles;
create policy profiles_delete_self
on public.profiles for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Prevent client-side self-awarding of verification, Premium, or Trust Badge.
revoke all on public.profiles from anon, authenticated;
grant select, delete on public.profiles to authenticated;
grant insert (user_id, display_name, age, gender, bio, interests, intent, vibe, visibility, privacy_radius)
  on public.profiles to authenticated;
grant update (display_name, age, gender, bio, interests, intent, vibe, visibility, privacy_radius)
  on public.profiles to authenticated;

-- Viewer discovery preferences are private to that viewer.
drop policy if exists discovery_preferences_select_self on public.discovery_preferences;
create policy discovery_preferences_select_self
on public.discovery_preferences for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists discovery_preferences_insert_self on public.discovery_preferences;
create policy discovery_preferences_insert_self
on public.discovery_preferences for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists discovery_preferences_update_self on public.discovery_preferences;
create policy discovery_preferences_update_self
on public.discovery_preferences for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists discovery_preferences_delete_self on public.discovery_preferences;
create policy discovery_preferences_delete_self
on public.discovery_preferences for delete
to authenticated
using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.discovery_preferences to authenticated;

-- Presence follows PROFILE visibility. Ghost/paused/invisible-until-match never leaks through map presence.
drop policy if exists presence_read_active_shared_network on public.presence;
create policy presence_read_active_shared_network
on public.presence for select
to authenticated
using (
  user_id = (select auth.uid())
  or (
    active_until > now()
    and not private.is_blocked_pair(user_id)
    and exists (
      select 1 from public.profiles p
      where p.user_id = presence.user_id
        and p.visibility in ('visible','travel')
    )
  )
);

drop policy if exists presence_insert_self on public.presence;
create policy presence_insert_self
on public.presence for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists presence_update_self on public.presence;
create policy presence_update_self
on public.presence for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists presence_delete_self on public.presence;
create policy presence_delete_self
on public.presence for delete
to authenticated
using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.presence to authenticated;

-- Photos: public photos are shared according to profile visibility; private photos need an explicit active grant.
drop policy if exists photos_read_public_or_self on public.profile_photos;
create policy photos_read_public_or_self
on public.profile_photos for select
to authenticated
using (
  user_id = (select auth.uid())
  or (
    not is_private
    and not private.is_blocked_pair(user_id)
    and exists (
      select 1 from public.profiles p
      where p.user_id = profile_photos.user_id
        and p.visibility in ('visible','travel')
    )
  )
  or (is_private and private.can_view_private_album(user_id))
);

drop policy if exists photos_manage_self_insert on public.profile_photos;
create policy photos_manage_self_insert
on public.profile_photos for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists photos_manage_self_update on public.profile_photos;
create policy photos_manage_self_update
on public.profile_photos for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists photos_manage_self_delete on public.profile_photos;
create policy photos_manage_self_delete
on public.profile_photos for delete
to authenticated
using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.profile_photos to authenticated;

-- Signals.
drop policy if exists signals_read_participants on public.signals;
create policy signals_read_participants
on public.signals for select
to authenticated
using ((select auth.uid()) in (sender_id, recipient_id));

drop policy if exists signals_send_self on public.signals;
create policy signals_send_self
on public.signals for insert
to authenticated
with check (
  (select auth.uid()) = sender_id
  and status = 'pending'
  and expires_at > now()
  and not private.is_blocked_pair(recipient_id)
);

drop policy if exists signals_recipient_resolve on public.signals;
create policy signals_recipient_resolve
on public.signals for update
to authenticated
using ((select auth.uid()) = recipient_id and status = 'pending')
with check ((select auth.uid()) = recipient_id and status in ('accepted','declined','blocked'));

drop policy if exists signals_sender_cancel on public.signals;
create policy signals_sender_cancel
on public.signals for update
to authenticated
using ((select auth.uid()) = sender_id and status = 'pending')
with check ((select auth.uid()) = sender_id and status = 'cancelled');

grant select, insert, update on public.signals to authenticated;

-- Match creation happens server-side when a recipient accepts a Signal.
create or replace function private.create_match_on_signal_accept()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status = 'pending' and new.status = 'accepted' then
    insert into public.matches (user_a, user_b)
    values (least(new.sender_id, new.recipient_id), greatest(new.sender_id, new.recipient_id))
    on conflict do nothing;
  end if;
  return new;
end;
$$;
revoke all on function private.create_match_on_signal_accept() from public, anon, authenticated;

drop trigger if exists create_match_after_signal_accept on public.signals;
create trigger create_match_after_signal_accept
after update of status on public.signals
for each row execute function private.create_match_on_signal_accept();

drop policy if exists matches_read_members on public.matches;
create policy matches_read_members
on public.matches for select
to authenticated
using ((select auth.uid()) in (user_a, user_b));

drop policy if exists matches_update_members on public.matches;
create policy matches_update_members
on public.matches for update
to authenticated
using ((select auth.uid()) in (user_a, user_b))
with check ((select auth.uid()) in (user_a, user_b));

grant select, update on public.matches to authenticated;

-- Messaging is limited to active matches.
drop policy if exists messages_read_match_members on public.messages;
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

drop policy if exists messages_send_as_self_to_match on public.messages;
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

grant select, insert on public.messages to authenticated;

-- Blocks are private: a user can manage their own block list, but cannot query who blocked them.
drop policy if exists blocks_read_self on public.blocks;
create policy blocks_read_self
on public.blocks for select
to authenticated
using ((select auth.uid()) = blocker_id);

drop policy if exists blocks_insert_self on public.blocks;
create policy blocks_insert_self
on public.blocks for insert
to authenticated
with check ((select auth.uid()) = blocker_id);

drop policy if exists blocks_delete_self on public.blocks;
create policy blocks_delete_self
on public.blocks for delete
to authenticated
using ((select auth.uid()) = blocker_id);

grant select, insert, delete on public.blocks to authenticated;

-- Private album access can only be granted by the owner to a current match.
drop policy if exists album_grants_read_participants on public.private_album_grants;
create policy album_grants_read_participants
on public.private_album_grants for select
to authenticated
using ((select auth.uid()) in (owner_id, viewer_id));

drop policy if exists album_grants_insert_owner on public.private_album_grants;
create policy album_grants_insert_owner
on public.private_album_grants for insert
to authenticated
with check (
  (select auth.uid()) = owner_id
  and not private.is_blocked_pair(viewer_id)
  and exists (
    select 1 from public.matches m
    where m.closed_at is null
      and ((m.user_a = owner_id and m.user_b = viewer_id)
        or (m.user_b = owner_id and m.user_a = viewer_id))
  )
);

drop policy if exists album_grants_update_owner on public.private_album_grants;
create policy album_grants_update_owner
on public.private_album_grants for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

drop policy if exists album_grants_delete_owner on public.private_album_grants;
create policy album_grants_delete_owner
on public.private_album_grants for delete
to authenticated
using ((select auth.uid()) = owner_id);

grant select, insert, update, delete on public.private_album_grants to authenticated;

-- Reports are visible only to the reporter on the client. Moderation uses privileged server access.
drop policy if exists reports_read_self on public.reports;
create policy reports_read_self
on public.reports for select
to authenticated
using ((select auth.uid()) = reporter_id);

drop policy if exists reports_insert_self on public.reports;
create policy reports_insert_self
on public.reports for insert
to authenticated
with check ((select auth.uid()) = reporter_id and not private.is_blocked_pair(target_id));

grant select, insert on public.reports to authenticated;

-- Automatic timestamps.
create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function private.touch_updated_at();

drop trigger if exists discovery_touch_updated_at on public.discovery_preferences;
create trigger discovery_touch_updated_at
before update on public.discovery_preferences
for each row execute function private.touch_updated_at();

drop trigger if exists presence_touch_updated_at on public.presence;
create trigger presence_touch_updated_at
before update on public.presence
for each row execute function private.touch_updated_at();

-- Realtime surfaces. Run once on a fresh Neara project.
alter publication supabase_realtime add table public.presence;
alter publication supabase_realtime add table public.signals;
alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.messages;
