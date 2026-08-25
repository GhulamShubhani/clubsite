# Clubshop

Multi-tenant no-code website platform for gaming clubs (Next.js + Prisma + Supabase PostgreSQL).

Aligned with the *Gaming Club No-Code Website Platform* client proposal.

## Setup

1. Copy `.env.example` → `.env` (URL-encode `@` in DB passwords as `%40`).
2. `npm install`
3. `npx prisma db push`
4. `npm run db:seed`
5. `npm run dev`

- Platform: http://localhost:3000  
- Club site: http://{slug}.localhost:3000  
- Admin: http://localhost:3000/admin  

## Proposal coverage

| Area | Status |
|------|--------|
| Landing + registration (slug check) | Done |
| Tenant + subdomain + configurable trial | Done |
| Strict tenant isolation | Done |
| Dynamic hostname → tenant routing | Done |
| Admin (website, pages, builder, templates, media, nav, theme, SEO, analytics, subscription, domains, members, account) | Done |
| 8 templates + apply | Done |
| Page CRUD: create/rename/delete/duplicate/reorder/hide/publish | Done |
| Visual builder (library, canvas, properties, undo/redo, devices) | Done |
| Standard + gaming components | Done |
| Hero layouts + navbar customization | Done |
| TipTap rich text | Done |
| Style + responsive overrides | Done |
| Draft / preview / publish | Done |
| Version history restore + publish previous | Done |
| Media upload / search / rename / builder picker | Done |
| Public render + theme + SEO metadata + sitemap/robots | Done |
| Roles (Owner/Admin/Editor/Viewer) | Done |
| Analytics (views, unique, top pages, referrers, device) | Done |
| Plans (Trial/Starter/Pro/Business) + limits | Done |
| Custom domains (map + verify MVP) | Done |
| Rate limit + security headers + sanitize + audit | Done |
| Contact form + live countdown | Done |

## Deferred (post-MVP)

- Stripe/payment checkout for plan upgrades
- Real DNS TXT/CNAME proof for custom domains

## Verify

```bash
npm run test:csf
```
