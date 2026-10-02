# RBA CMS
Next.js 15 admin for RBA Films & Photography. Run `npm i && cp .env.example .env.local && npm run dev`.
Set `ADMIN_PASSWORD` and `SESSION_SECRET` in Vercel, then add domain cms.rbaweddingfilms.com.
`supabase/schema.sql` holds the Phase 1 tables with owner-only row level security. Dashboard currently reads `lib/data.ts`.
