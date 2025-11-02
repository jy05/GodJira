# GodJira Frontend — Build Orchestration Prompt (Source of Truth)

## 0) Ground Rules (follow exactly)
- **Style/stack:** React 18 + TypeScript, Vite, React Router v6 (hash routing), TanStack Query for server state, Context API for auth, Tailwind CSS, React Hook Form, Axios with interceptors, Socket.io client.
- **Security/compliance constraints:** NIST password rules, JWT access 30m + refresh 7d, lockout after 5 failed attempts/15 min, rate-limit 100 req/min; avatars/attachments stored as **base64**; CORS must use configured FRONTEND_URL.
- **Scope boundary:** Implement UI for **all** API modules (Auth, Users, Projects, Sprints, Issues, Comments, Work Logs, Issue Links, Watchers, Teams, Notifications, Analytics, Attachments, Export), plus WebSocket notifications.
- **Performance & a11y:** Page loads <2 s, API <200 ms (as available), WCAG 2.1 AA on the frontend.
- **Pause protocol:** After each section below, **stop and wait for my input** before continuing. Offer a short demo checklist I can click through.

## 1) Milestone Map (build in this order)
**Phase 1 — Foundations (Auth + Shell)**
1. **Project shell & routing, theme, layout, error boundaries.**
2. **Auth flows:** register, login, refresh, logout, email verify, forgot/reset; token storage with HTTP-only cookies/headers; lockout and validation UX.

**Phase 2 — Users & Profile**
3. **User profile & settings:** view/update me, change password, upload **avatar** (base64). Validate size ≤10 MB & MIME.
4. **Admin user management:** list/search users, activate/deactivate, role changes (ADMIN/MANAGER/USER).

**Phase 3 — Projects & Sprints**
5. **Projects:** CRUD, get by key, statistics; enforce project keys (2–10 uppercase).
6. **Sprints:** create/edit/delete; **start/complete** flows; statistics + **burndown**/**velocity** visuals.

**Phase 4 — Issues & Backlog**
7. **Issues CRUD + details:** key lookup, filters, status changes, assign, parent⇄sub-task, labels, story points, priorities, types.
8. **Backlog & Kanban:** backlog grooming and **drag-and-drop board**.
9. **Issue links:** create/list/delete with BLOCKS / RELATES_TO / DUPLICATES / PARENT/CHILD.

**Phase 5 — Collaboration**
10. **Comments with @mentions** (+ notifications), **watchers**, **teams** (members/roles, projects).
11. **Real-time notifications:** Socket.io client with JWT; unread count, mark read/all, delete.

**Phase 6 — Time, Files, Export**
12. **Work logs:** create/view/update/delete; user/issue stats.
13. **Attachments:** upload/list/get/delete; generate and display thumbnails; enforce size limits (10 MB avatar, 20 MB attachments).
14. **Export:** CSV/Excel for issues, sprints, work logs, user activity.

**Phase 7 — Analytics & Dashboards**
15. **Analytics:** sprint burndown, sprint velocity, issue aging, team capacity, project summary.

**Phase 8 — Ops UX**
16. **Health/metrics surfaces:** show API health and counts; handle rate-limit and auth errors gracefully.

**Phase 9 — Cross-cutting**
17. **Internationalization (planned), Accessibility (WCAG 2.1 AA), Testing hooks for E2E.

## 2) Per-Phase Definition of Done (apply each time)
- **Wiring:** All listed endpoints for that phase are integrated and typed; error states handled (401/403/429/5xx).
- **UX checks:** Forms use React Hook Form with inline validation matching NIST rules; success and failure toasts; loading and empty states.
- **Security:** JWT refresh on expiry, HTTPS-ready, CORS to `FRONTEND_URL`; never persist raw files—use base64 from API.
- **Real-time:** If notifications are in scope, sockets authenticate with JWT and reflect server state.
- **Demo checklist:** Provide a bullet list of manual steps I can execute to confirm behavior. Then **pause**.

## 3) Data Contracts & Modules (reference this when binding UI)
- Use the documented module list and endpoints for **Auth, Users, Projects, Sprints, Issues, Work Logs, Comments, Issue Links, Watchers, Teams, Notifications, Analytics, Attachments, Export**. Treat these as canonical.

## 4) UI Must-Haves (non-functional)
- **Access control:** Hide/disable controls based on **RBAC** (ADMIN/MANAGER/USER).
- **Rate-limit UX:** Detect 429 and coach the user to retry; surface remaining quota if provided.
- **Error hygiene:** Don’t leak stack traces; map known validation errors to field messages (NIST password rules, sizes, MIME).
- **Perf:** Paginate lists (20/page default aligns with backend), cache with TanStack Query, optimistic updates only where safe.

## 5) Attachments/Avatars — strict rules
- Only accept documented formats; enforce 10 MB (avatar) and 20 MB (issue attachments); thumbs 200×200 from backend; **no local file path exposure**.
- **Virus scanning is excluded** at backend per current scope; expose a warning tooltip in UI.

## 6) Analytics — scope
- Implement charts for sprint **burndown** and **velocity**, **issue aging**, **team capacity**; leave **custom dashboards** placeholder.

## 7) Deliverable Rhythm
For **each** phase:
1) Propose UI surface(s) and data flows (one paragraph).
2) List exact endpoints touched.
3) List client-side state keys/queries and invalidation rules.
4) Supply a **manual demo checklist** (5–8 steps).
5) **Pause and wait** for my confirmation.

## 8) Environment Assumptions
- API lives at `http://localhost:3000`, Swagger at `/api/docs`. Use `FRONTEND_URL` for CORS in envs.
- Backend is **100% complete** and production-ready; you are building the frontend on top.

## 9) Change Management
- If a requirement conflicts with docs, cite the exact doc line(s) and propose a resolution before coding further. Use the compliance report and checklist as arbiters.

**Begin at Phase 1. When finished with Phase 1, stop and wait for my input before proceeding.**
