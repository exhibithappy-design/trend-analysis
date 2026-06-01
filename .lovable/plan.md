## Phase 3 — AI Command Center

Build four surfaces on top of the existing admin shell, reusing the `ad-*` design system and dark theme.

### 1. Sidebar + routing

- Add to `AdminLayout.tsx` nav: **Insights** (`/admin/insights`, `Sparkles` icon) and **AI Chat** (`/admin/chat`, `MessageSquare` icon), placed above Settings.
- Register both routes in `src/App.tsx` inside the `<Route path="/admin">` block.

### 2. Database changes (one migration)

- `ai_insights` already exists but stores generic insights. Reuse it for the Insight Engine, plus add a new `kind` column (`'engagement'|'trend'|'recommendation'|'anomaly'`) and `metadata jsonb` for source refs (edition id, card id, links). Add index on `(generated_at desc)`.
- New `app_settings` table (key/value jsonb, admin-only RLS) to hold integration flags such as `hubspot.connected`, `hubspot.last_synced_at`. The HubSpot API key itself is stored as a Lovable Cloud secret, not in the DB.
- New `ai_chat_messages` table: `id, user_id, role ('user'|'assistant'|'system'), content text, created_at`. RLS: users read/write their own rows; admins read all. GRANTs for `authenticated` + `service_role`.

### 3. Edge functions (Lovable AI Gateway)

All call `https://ai.gateway.lovable.dev/v1/chat/completions` with `LOVABLE_API_KEY` (already in secrets). Model default: `google/gemini-3-flash-preview`.

- `supabase/functions/insights-generate/index.ts` — admin-only. Pulls aggregates from `page_events`, `editions`, `trend_cards`, `deployments`, `aeo_keywords` (last 30 days), summarizes into JSON via tool calling (`{insights:[{kind,title,body,metadata}]}`), writes rows into `ai_insights` with `status='new'` and returns them. Handles 429/402 errors.
- `supabase/functions/admin-chat/index.ts` — authenticated. Receives `{messages}`, validates JWT via `getClaims`, injects a system prompt + compact data snapshot (counts and top-N rows from the same tables), streams SSE back to the client, and persists user + assistant turns to `ai_chat_messages` after stream completes.
- `supabase/functions/hubspot-connect/index.ts` — admin-only stub. Accepts a HubSpot API key, stores it via `Deno.env` check + `app_settings` flag update (`hubspot.connected=true`). Real key submission flows through `add_secret` (handled outside the function). Function exposes `GET` to return current connection status and `POST` to mark connected/disconnected.

`supabase/config.toml`: no overrides needed (default `verify_jwt=false`; we validate in code).

### 4. Insight Engine + Content Recommendations (`/admin/insights`)

`src/pages/admin/Insights.tsx` with two tabs (`ad-tabs`): **Engagement insights** and **Content recommendations**.

- Header with title, last-generated timestamp, and `Refresh insights` button (admins only). Button calls `insights-generate`; non-admins see read-only view.
- Cards render from `ai_insights` filtered by `kind`. Card layout uses `.ad-card` with status pill, body, and contextual CTA:
  - Engagement cards: link to relevant edition (`/admin/editions/:id`) when `metadata.edition_id` present.
  - Recommendation cards: link into Content Library with `?card=<id>` query (extend `ContentLibrary` to read the param and scroll/highlight).
- Empty state when no insights exist: seed 4–6 realistic placeholder cards client-side (engagement anomaly, top performer, underperformer in Depth mode, new trend candidate, week-over-week drop, copy refresh). Seeds are clearly labeled `Sample`. Once the function returns real rows, seeds disappear.
- Realtime subscribe to `ai_insights` so new rows appear without refresh.

### 5. HubSpot integration placeholder

- Distribution Tracker (`src/pages/admin/Distribution.tsx`): swap the hardcoded `HUBSPOT_CONNECTED = false` for a value read from the new `app_settings` row. "Connect HubSpot" button in the cell now routes admins to `/admin/settings?tab=integrations` instead of an alert.
- Settings (`src/pages/admin/Settings.tsx`): add a new `integrations` tab (admin only). Card shows HubSpot status (`Pending connection` / `Connected · last synced …`), a button **Connect HubSpot** that triggers the `add_secret` flow for `HUBSPOT_API_KEY`, then calls `hubspot-connect` to flip the flag. Provide a **Disconnect** button that clears the flag. Tab honors `?tab=integrations` query param so the Distribution link lands here.
- Distribution cell rendering: when connected, show same placeholder metrics (Recipients, Opens, Clicks) but with green dot and "Awaiting first sync" copy until real data arrives. Real sync wiring is out of scope for this phase.

### 6. AI Chat (`/admin/chat`)

`src/pages/admin/Chat.tsx` — full-page chat surface inside the admin shell.

- Layout: header with title `Ask the data`, model name, and `Clear conversation` button. Below it, a scrollable message list (`.ad-card` style bubbles, distinct backgrounds for user vs assistant). Sticky composer at the bottom: textarea + send button + `Cmd/Ctrl+Enter` shortcut.
- Streams responses from `admin-chat` using the SSE pattern from the AI Gateway docs: token-by-token append to the last assistant message. Render markdown via `react-markdown` (`bun add react-markdown`).
- Load prior history from `ai_chat_messages` for the current user, ordered ascending, on mount. New turns persist via the edge function.
- Suggested-prompt chips above the empty state ("What changed in engagement last week?", "Which trends are underperforming in Depth mode?", "Top 5 editions by completion rate", "Which AEO keywords slipped?").
- Error toasts for 402 (credits) and 429 (rate limit) using existing Sonner toaster.

### 7. Styling additions (`admin.css`)

Append (no edits to existing rules):
- `.ad-insight-grid` (responsive 2-col grid) and `.ad-insight-card` variants for kind colors.
- `.ad-chat-shell`, `.ad-chat-list`, `.ad-chat-bubble.user`, `.ad-chat-bubble.assistant`, `.ad-chat-composer` for the chat surface.
- `.ad-suggest-chip` for prompt suggestions.
- `.ad-integration-card` for the HubSpot panel (status dot + actions).

### Technical notes

- Use `useAdminAuth` everywhere for gating; admin-only actions hidden for viewers.
- All Supabase calls flow through the existing client; no schema-bypass.
- Seed insights live in `src/lib/admin/seedInsights.ts` so they can be removed once data flows.
- New dependency: `react-markdown` for chat rendering.