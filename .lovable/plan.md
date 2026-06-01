# Admin Dashboard — Phase 1

A new `/admin` section gated by magic-link sign-in, with three main surfaces (Editions Index, Edition Detail, Distribution Tracker), a Notes panel, and a Settings panel. Existing `TrendReport2026` page is untouched.

## Auth & access control

- Supabase magic-link sign-in (no passwords). Login page at `/admin/login`.
- `authorized_emails` allowlist table seeded with the three placeholder emails. Sign-in attempts from emails not on the list are rejected with a friendly message.
- `user_roles` table (separate from profile) with enum `app_role` = `admin | viewer`. Security-definer `has_role()` function used in RLS — no recursion, no client-side role checks.
- Admin: full access, manages users/settings/channels, creates editions.
- Viewer: read-only on editions/deployments/analytics, but can add notes/tags and edit own profile.
- Unauthenticated visitors hitting any `/admin/*` route → redirect to `/admin/login`.
- The three seed emails are inserted as Admins. They can sign in via magic link the first time they visit.

## Surfaces

### 1. Editions Index — `/admin/editions`
Scannable editorial table on dark background. Columns: title, edition label, publish date, status badge, lifetime views, lifetime unique visitors, 7-day delta (▲/▼), avg time on page, CTA conversions, distribution status icons (Mailshake/HubSpot/LinkedIn — green/amber/red/gray dots), row actions (View, Open public page, Archive).
Header: search by title, filters (status, date range, distribution health), sort by any column, "Create new edition" (Admin only).
Top-decile rows (by views or conversion) get a subtle pink `#FF0069` left accent.

### 2. Edition Detail — `/admin/editions/:id`
Top strip: title, publish date, status, public link, time-range picker (24h/7d/30d/all-time/custom), compare-to (previous edition / YoY / none).
6 hero metric cards: page views, unique visitors, avg time on page, scroll depth (median), CTA CTR, conversions — each with delta vs comparison window.
Source attribution panel: donut chart split across Organic search, AI engine referrals (ChatGPT/Perplexity/Claude/Gemini broken out), LinkedIn, Direct, HubSpot email, Referral. Click a slice to filter the rest of the detail view.
Notes panel (right column or below): timestamped free-text notes, add note inline, searchable across all editions.

### 3. Distribution Tracker — `/admin/distribution`
Matrix: editions × channels (Mailshake, HubSpot, LinkedIn + custom). Each cell shows status (Not deployed/Queued/Live/Completed/Failed), last action timestamp, recipient count, link to deployment record. Per-cell actions: Mark deployed, add note, view log. Persistent banner at top for any deployment Queued > 5 days or scheduled actions overdue.

### Settings — `/admin/settings`
- Users tab (Admin only): list, add/remove email, change role.
- Profile tab (everyone): name, notification preferences.
- Channels tab (Admin only): add/rename distribution channels.

### Notes panel
Lives in Edition Detail. Cross-edition search exposed in Settings → Notes search (or a global search box).

## Data model (new Supabase tables)

All in `public` schema. Each `CREATE TABLE` followed by `GRANT` + `ENABLE RLS` + `CREATE POLICY`. Realtime publication added for `editions`, `deployments`, `page_events`, `notes`, `ai_insights` so the UI refreshes every 30s via subscriptions.

```text
authorized_emails  (email pk, role app_role, invited_at)
user_roles         (id, user_id, role app_role, unique(user_id,role))
profiles           (id pk = auth.users.id, name, notification_prefs jsonb, last_active)
editions           (id, title, slug, edition_label, status, publish_date, archive_date,
                    public_url, created_by, created_at, updated_at)
page_events        (id, edition_id, session_id, event_type, section, card_id,
                    source, source_detail, ts, user_agent, viewport_size)
deployments        (id, edition_id, channel, status, deployed_at, deployed_by,
                    recipient_count, external_url, notes, updated_at)
channels           (id, name, slug, is_custom, created_at)
trend_cards        (id, edition_id, category, title, body, tags text[],
                    cited_shows text[], performance_score, created_at)
ai_insights        (id, edition_id nullable, insight_type, content, status,
                    generated_at, resolved_at, resolved_by)
hubspot_signals    (id, hubspot_contact_id, contact_name, contact_company,
                    signal_type, signal_strength, edition_id, captured_at, status)
notes              (id, edition_id nullable, deployment_id nullable, author_id,
                    content, created_at)
```

A trigger on `auth.users` insert auto-creates a `profiles` row and, if the email is in `authorized_emails`, also a matching `user_roles` row.

### RLS sketch
- `authorized_emails`, `user_roles`, `channels`: admin-only write; authenticated read.
- `editions`, `deployments`, `trend_cards`, `ai_insights`, `hubspot_signals`, `page_events`: authenticated read; admin write.
- `notes`: authenticated read+insert (any role can add); author or admin can update/delete.
- `profiles`: own row read/write; admin can read all.

### Seed data
Realistic placeholders so every surface is populated: 4–5 editions across Draft/Live/Archived, ~2k page_events across the last 60 days with varied sources (incl. AI engines), ~12 deployments across channels with mixed statuses (incl. a queued-too-long row), 8 trend cards, a handful of ai_insights, hubspot_signals, and notes.

## Frontend (Vite + React + Tailwind)

New routes wired in `src/App.tsx`:
```
/admin/login
/admin                          → redirects to /admin/editions
/admin/editions
/admin/editions/:id
/admin/distribution
/admin/settings
```
- `src/pages/admin/` for pages, `src/components/admin/` for shared chrome (sidebar, topbar, status dot, metric card, donut, matrix cell, etc.).
- `AdminLayout` wraps all `/admin/*` routes: dark theme (`#000` bg, `#141414`/`#1A1A1A` surfaces, `#2A2A2A` borders, Poppins, pink `#FF0069` accent, gold `#AD9675` used only on "Acted On" + critical alerts). Scoped via a `data-admin-theme` wrapper + admin-only CSS file so it does not leak into the existing report page.
- Auth context using `supabase.auth.onAuthStateChange` + `getSession()`; role fetched via `has_role` RPC and cached. Route guard component redirects unauthenticated → `/admin/login`, and non-allowlisted users → an "Access denied" screen.
- Charts: lightweight donut and sparkline built with SVG (no gradient, no decorative animation). No new heavy chart lib added.
- Realtime: a small `useRealtime(table, filter)` hook subscribes via `supabase.channel(...)` and invalidates the relevant React Query keys; in addition every list view sets a 30s `refetchInterval` as a fallback.
- Empty states for every list/matrix include a clear next action (e.g. "Create your first edition", "No deployments yet — Mark as deployed").

## Out of scope (Phase 1)
- Full AI insights workflow UI (table + seed only; surface comes later).
- HubSpot signals dashboard surface (table + seed only).
- Actually sending magic-link emails from a custom domain (uses default Lovable Cloud auth email until the user asks to brand it).
- Editing the public TrendReport page from admin.

## Build order
1. Migration: enum + all tables + GRANTs + RLS + triggers + realtime publication.
2. Seed migration with placeholder data.
3. Admin theme + layout + auth guard + login page.
4. Editions Index.
5. Edition Detail with metrics, donut, notes.
6. Distribution Tracker matrix + stalled banner.
7. Settings (users, profile, channels).
8. Realtime hook wired into list views.
