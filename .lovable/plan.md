
# AI Workplace Productivity Assistant — Build Plan

A polished, dark-first SaaS app with auth, dashboard, and five AI tools, powered by Lovable Cloud (auth + database) and Lovable AI Gateway (Gemini).

## Design Direction

- **Theme**: Dark-first (deep navy `#0B1020` base, panels `#111733`), with light toggle. Glassmorphism cards, soft shadows, subtle grid/aurora background.
- **Palette**: Primary blue `#3B82F6`, purple accent `#8B5CF6`, gradient `from-blue-500 via-indigo-500 to-purple-500`, foreground near-white, muted slate.
- **Type**: Space Grotesk (display) + Inter (body) via `@fontsource`.
- **Motion**: Framer Motion for page transitions, card hover lift, dashboard counter count-ups, typing dots in chat, fade/slide for tool outputs.
- **Components**: shadcn/ui + AI Elements for chat composer/transcript.

## Pages & Routes

Public:
- `/` Landing — hero with animated gradient + product mockup, feature grid (5 tools), stats counters, testimonials, CTA, footer.
- `/auth` Login / Register (email+password and Google).

Authenticated (`/_authenticated/`):
- `/dashboard` — greeting, productivity score, usage stats, recent activity (from `ai_history`), quick-access tool cards.
- `/email` Smart Email Generator
- `/meetings` Meeting Notes Summarizer
- `/tasks` AI Task Planner & Scheduler
- `/research` AI Research Assistant
- `/chat` AI Chatbot (single ongoing conversation)
- `/settings` Profile, theme toggle, AI preferences, data export/delete

Shared authenticated layout: collapsible sidebar (logo, nav, user menu) + topbar (search, theme toggle, avatar).

## Backend (Lovable Cloud)

Enable Lovable Cloud. Auth: email/password + Google (via Lovable broker, `supabase--configure_social_auth google`).

Tables (all with RLS scoped to `auth.uid()`, grants for `authenticated` + `service_role`):
- `profiles` (id → auth.users, full_name, avatar_url, theme, created_at) + signup trigger.
- `ai_history` (id, user_id, tool_type, prompt jsonb, response text, created_at) — feeds dashboard + per-tool history.
- `tasks` (id, user_id, title, notes, priority, deadline, status, ai_score, created_at).
- `chat_messages` (id, user_id, role, content, created_at) — single conversation per user.

Server functions (`src/lib/*.functions.ts`, all `requireSupabaseAuth`):
- `generateEmail`, `summarizeMeeting`, `planTasks`, `researchSummarize` — call Lovable AI, persist to `ai_history`, return result.
- `listHistory`, `listTasks`, `createTask`, `updateTask`, `deleteTask`.
- `listChatMessages`, `clearChat`.

Streaming chat server route: `src/routes/api/chat.ts` using AI SDK `streamText` + `toUIMessageStreamResponse`, persists user + assistant messages in `onFinish`.

AI provider: shared `src/lib/ai-gateway.server.ts` helper, model `google/gemini-3-flash-preview` for all tools.

## Tool UX Details

- **Email Generator**: form (purpose, recipient type select, key points textarea, tone select) → AI Elements `Response` output card → Copy, Regenerate, Export TXT/PDF (jsPDF).
- **Meeting Summarizer**: drag/drop `.txt`/`.md` or paste → structured output `{summary, decisions[], actionItems[], deadlines[], urgent[]}` rendered as tabs/sections → Download `.md`.
- **Task Planner**: add tasks list → "Plan my day" → AI returns prioritized order + time blocks + productivity tips; tasks persisted, status toggles, productivity score widget.
- **Research Assistant**: paste text/URL → summary + key insights + quick-read + recommendations sections.
- **Chatbot**: AI Elements `Conversation`, `Message`, `MessageResponse`, `PromptInput`, `Shimmer`; suggested prompt chips; persisted single thread; clear-chat button.

Every AI output includes a small "AI-generated — review before sending" disclaimer chip.

## Technical Plan

1. Enable Lovable Cloud; ensure `LOVABLE_API_KEY` exists.
2. Install: `framer-motion`, `@fontsource/space-grotesk`, `@fontsource/inter`, `jspdf`, `react-dropzone`, `ai`, `@ai-sdk/react`, `@ai-sdk/openai-compatible`, `zod`, AI Elements (`conversation message prompt-input shimmer`).
3. Tokens in `src/styles.css` (dark default, light variant, gradients, glass shadow).
4. Migration: enums, tables, RLS, grants, profile trigger.
5. `src/lib/ai-gateway.server.ts` provider helper.
6. Server functions per tool + chat route.
7. Auth page (email/password + Google via `lovable.auth.signInWithOAuth`).
8. `_authenticated/route.tsx` already managed; build sidebar layout at `_authenticated/route.tsx`'s child or a nested pathless layout `_authenticated/_app.tsx` with shared shell.
9. Build each tool page with TanStack Query (`ensureQueryData` + `useSuspenseQuery`) for history/tasks/messages.
10. Landing page with Framer Motion sections.
11. Theme toggle (class on `<html>`, persisted in `profiles.theme` + localStorage).
12. SEO `head()` per public route.
13. Verify build + run a smoke check via Playwright.

## Out of Scope (Phase 2)

Voice input, calendar sync, team collaboration, notifications, multi-language, analytics charts beyond basics.
