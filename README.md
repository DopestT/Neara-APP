# Neara

Neara is a privacy-first, map-first social discovery network for adults.

## Product rule

**One shared live network. Your settings control only what you see.**

Neara does not create separate straight, gay, lesbian, bisexual, or other maps. Every adult account belongs to the same underlying network. Each viewer applies a private discovery lens to their own map: gender(s), age range, approximate distance/zone, intent, vibe, interests, and verification filters.

Discovery preferences are not public profile fields and must never be used to partition the network.

## Current product surfaces

- Privacy-safe live map with approximate areas rather than exact pins
- Multi-gender viewer-only discovery filters
- Onboarding and adult age gate
- Profiles, photos, private album UI, profile-strength checks
- Signals and matches
- Chat and safety scanning
- Blocking, hiding, and reporting
- Ghost/paused/travel visibility modes
- Verification and Premium surfaces
- Safety Center and legal screens

## Production backend contract

`supabase/schema.sql` contains the production data model and RLS contract for:

- public profiles with server-controlled Verification/Premium fields
- private viewer-only discovery preferences
- approximate live presence
- profile photos and private-album grants
- Signals and server-created matches
- messages
- blocks and reports
- Realtime publication surfaces

Important privacy rules enforced by the schema:

- Ghost, Paused, and Invisible Until Match presence is not readable by other users.
- A user cannot self-award Verified, Premium, or Trust Badge.
- Blocks apply in both directions without exposing who blocked whom.
- Private albums require an explicit grant to an active match.
- Exact GPS and exact birth dates are intentionally excluded from public profile storage.

## Verification

GitHub Actions runs on `main`, build branches, and pull requests:

1. `npm ci`
2. `npm test`
3. `npm run build`
4. uploads the verified `dist` bundle from `main`

## Vercel

`vercel.json` provides SPA rewrites for `/onboarding` and `/app/*`, security headers, and immutable asset caching.

A Vercel preview project was created through the connected deployment API. Production promotion is currently restricted by the connected Vercel team role.

## Infrastructure gate

The connected Supabase organization `dopest projects` is on the Free plan and is at its two-project limit. Neara's production schema is ready but cannot be provisioned until a Supabase project slot is available or the organization plan changes.
