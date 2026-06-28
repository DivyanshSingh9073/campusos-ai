# TODO (CampusOS AI — Backend/Frontend integration)

- [ ] Create `Backend/app.js` exporting the Express `app` instance.
- [ ] Update `Backend/src/index.ts` to import/use `Backend/app.js` so runtime stays consistent.
- [ ] Add `Frontend/src/lib/api.ts` for fetch calls to `/api/*` and Authorization header support.
- [ ] Add `Frontend/.env` with `VITE_API_BASE_URL`.
- [ ] Update `Frontend/src/pages/LoginPage.tsx` to call `POST /api/auth/login`, store token, navigate to `/dashboard`.
- [ ] Update `Frontend/src/pages/SignupPage.tsx` to call `POST /api/auth/register`, navigate to `/`.
- [ ] Update `Frontend/src/pages/DashboardPage.tsx` to load tasks from `GET /api/tasks` and toggle completion via `PUT /api/tasks/:id`.
- [ ] Update `Frontend/src/pages/ProfilePage.tsx` to load `GET /api/auth/profile` and support logout.
- [ ] Run `npm run dev` for Backend and Frontend; manually verify signup/login/dashboard/profile connectivity.

