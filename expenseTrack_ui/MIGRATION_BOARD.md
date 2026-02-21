# React to Angular Migration Board (Nx Workspace)

Last updated: 2026-02-18
Workspace: `expenseTrack_ui`
React source: `../frontend`

## 1. Goal and Definition of Done

Goal: migrate the existing React frontend in `frontend` into the Angular Nx app in `expenseTrack_ui` with feature parity.

Definition of done:
- All current React routes exist in Angular and are reachable.
- Auth guard/session behavior matches current React flow.
- All backend endpoints currently used by React are wired in Angular services.
- Core flows pass: login/register, CRUD expenses, CRUD categories/subcategories, reports summary/export/import, settings update, currency conversion, logout.
- CI passes for `lint`, `test`, `build`, `e2e`.

## 2. Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Completed

## 3. Route and Feature Mapping

| React source | Current route | Angular target | Notes |
|---|---|---|---|
| `frontend/src/pages/LandingPage.jsx` | `/` | `libs/feature/landing/src/lib/landing-page.component.ts` | Public page |
| `frontend/src/pages/LoginPage.jsx` | `/login` | `libs/feature/auth/src/lib/login-page.component.ts` | Public page |
| `frontend/src/pages/RegisterPage.jsx` | `/register` | `libs/feature/auth/src/lib/register-page.component.ts` | Public page |
| `frontend/src/pages/Dashboard.jsx` | `/dashboard` | `libs/feature/dashboard/src/lib/dashboard-page.component.ts` | Protected |
| `frontend/src/pages/ExpensesPage.jsx` | `/expenses` | `libs/feature/expenses/src/lib/expenses-page.component.ts` | Protected |
| `frontend/src/pages/CategoriesPage.jsx` | `/categories` | `libs/feature/categories/src/lib/categories-page.component.ts` | Protected |
| `frontend/src/pages/ReportsPage.jsx` | `/reports` | `libs/feature/reports/src/lib/reports-page.component.ts` | Protected |
| `frontend/src/pages/SettingsPage.jsx` | `/settings` | `libs/feature/settings/src/lib/settings-page.component.ts` | Protected |
| `frontend/src/components/Sidebar.jsx` | shared | `libs/ui/layout/src/lib/sidebar.component.ts` | Protected shell |

## 4. API Inventory to Migrate

- `GET /api/auth/me`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `PUT /api/auth/profile`
- `GET /api/dashboard/stats`
- `GET /api/expenses`
- `POST /api/expenses`
- `PUT /api/expenses/:expense_id`
- `DELETE /api/expenses/:expense_id`
- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/:category_id`
- `DELETE /api/categories/:category_id`
- `POST /api/categories/:category_id/subcategories`
- `DELETE /api/categories/:category_id/subcategories/:subcategory_id`
- `GET /api/reports/summary?period=week|month|year`
- `GET /api/reports/export?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`
- `POST /api/reports/import`
- `GET /api/currencies/convert?amount=...&from_currency=...&to_currency=...`

## 5. Target Nx Library Layout

- `libs/feature/landing`
- `libs/feature/auth`
- `libs/feature/dashboard`
- `libs/feature/expenses`
- `libs/feature/categories`
- `libs/feature/reports`
- `libs/feature/settings`
- `libs/ui/layout`
- `libs/ui/shared`
- `libs/data-access/auth`
- `libs/data-access/dashboard`
- `libs/data-access/expenses`
- `libs/data-access/categories`
- `libs/data-access/reports`
- `libs/data-access/currency`
- `libs/util/models`

## 6. Concrete Migration Board

### Phase 0: Baseline and App Skeleton

| ID | Status | Task | Target files | Est. |
|---|---|---|---|---|
| MB-001 | [ ] | Replace Nx welcome shell with Angular app shell entry | `expenseTrack_ui/src/app/app.ts`, `expenseTrack_ui/src/app/app.html` | S |
| MB-002 | [ ] | Define Angular routes for all pages | `expenseTrack_ui/src/app/app.routes.ts` | S |
| MB-003 | [ ] | Add environment files and backend base URL replacement for `REACT_APP_BACKEND_URL` | `expenseTrack_ui/src/environments/environment.ts`, `expenseTrack_ui/src/environments/environment.development.ts` | S |
| MB-004 | [ ] | Register `HttpClient` and global interceptor with credentials/error mapping | `expenseTrack_ui/src/app/app.config.ts`, `expenseTrack_ui/src/app/core/interceptors/auth.interceptor.ts` | M |
| MB-005 | [ ] | Create shared API DTO/model types | `libs/util/models/*` | M |

Acceptance criteria:
- App boots without `NxWelcome`.
- Route skeleton works for public and protected paths.
- API base URL comes from Angular environment files.

### Phase 1: Auth and Route Protection

| ID | Status | Task | Source parity | Target files | Est. |
|---|---|---|---|---|---|
| MB-101 | [ ] | Implement auth service (`me/login/register/logout/profile`) | `frontend/src/App.js`, `frontend/src/pages/LoginPage.jsx`, `frontend/src/pages/RegisterPage.jsx`, `frontend/src/components/Sidebar.jsx`, `frontend/src/pages/SettingsPage.jsx` | `libs/data-access/auth/*` | M |
| MB-102 | [ ] | Implement auth guard equivalent to React `ProtectedRoute` | `frontend/src/App.js` | `expenseTrack_ui/src/app/core/guards/auth.guard.ts` | M |
| MB-103 | [ ] | Migrate login page with validation and loading states | `frontend/src/pages/LoginPage.jsx` | `libs/feature/auth/src/lib/login-page.component.ts` | M |
| MB-104 | [ ] | Migrate register page with profile type and preferred currency | `frontend/src/pages/RegisterPage.jsx` | `libs/feature/auth/src/lib/register-page.component.ts` | M |
| MB-105 | [ ] | Wire logout from shell/sidebar | `frontend/src/components/Sidebar.jsx` | `libs/ui/layout/src/lib/sidebar.component.ts` | S |

Acceptance criteria:
- Unauthenticated user on protected route is redirected to `/login`.
- Successful login/register lands on `/dashboard`.
- Logout returns to `/` and clears authenticated state.

### Phase 2: Shared Layout and Landing

| ID | Status | Task | Source parity | Target files | Est. |
|---|---|---|---|---|---|
| MB-201 | [ ] | Migrate landing page content/CTA flow | `frontend/src/pages/LandingPage.jsx` | `libs/feature/landing/src/lib/landing-page.component.ts` | M |
| MB-202 | [ ] | Build protected layout shell and responsive sidebar | `frontend/src/components/Sidebar.jsx` | `libs/ui/layout/src/lib/*` | M |
| MB-203 | [ ] | Create minimal shared UI components actually used by migrated pages | `frontend/src/components/ui/*` (only used subset) | `libs/ui/shared/src/lib/*` | M |

Acceptance criteria:
- Public pages do not show protected shell.
- Protected pages render shared sidebar and route links.

### Phase 3: Dashboard

| ID | Status | Task | Source parity | Target files | Est. |
|---|---|---|---|---|---|
| MB-301 | [ ] | Add dashboard data-access service (`stats`, monthly summary) | `frontend/src/pages/Dashboard.jsx` | `libs/data-access/dashboard/*` | S |
| MB-302 | [ ] | Migrate dashboard cards and quick actions | `frontend/src/pages/Dashboard.jsx` | `libs/feature/dashboard/src/lib/dashboard-page.component.ts` | M |
| MB-303 | [ ] | Migrate charts (pie + daily trend) with chosen Angular charting lib | `frontend/src/pages/Dashboard.jsx` | `libs/feature/dashboard/src/lib/*` | M |

Acceptance criteria:
- Dashboard loads both stats and summary.
- Currency formatting uses user preferred currency.

### Phase 4: Expenses

| ID | Status | Task | Source parity | Target files | Est. |
|---|---|---|---|---|---|
| MB-401 | [ ] | Create expenses service (list/create/update/delete) | `frontend/src/pages/ExpensesPage.jsx` | `libs/data-access/expenses/*` | M |
| MB-402 | [ ] | Create categories lookup service for expense form selects | `frontend/src/pages/ExpensesPage.jsx` | `libs/data-access/categories/*` | S |
| MB-403 | [ ] | Migrate expense list with search/filter | `frontend/src/pages/ExpensesPage.jsx` | `libs/feature/expenses/src/lib/expenses-page.component.ts` | L |
| MB-404 | [ ] | Migrate add/edit expense modal form and date picker behavior | `frontend/src/pages/ExpensesPage.jsx` | `libs/feature/expenses/src/lib/expenses-form.component.ts` | L |
| MB-405 | [ ] | Implement delete confirmation and success/error toasts | `frontend/src/pages/ExpensesPage.jsx` | `libs/feature/expenses/src/lib/*` | S |

Acceptance criteria:
- User can add, edit, delete expenses.
- Category and subcategory selection logic matches React behavior.

### Phase 5: Categories and Subcategories

| ID | Status | Task | Source parity | Target files | Est. |
|---|---|---|---|---|---|
| MB-501 | [ ] | Create categories service with subcategory actions | `frontend/src/pages/CategoriesPage.jsx` | `libs/data-access/categories/*` | M |
| MB-502 | [ ] | Migrate category CRUD and color picker | `frontend/src/pages/CategoriesPage.jsx` | `libs/feature/categories/src/lib/categories-page.component.ts` | M |
| MB-503 | [ ] | Migrate collapsible subcategory list and add/delete actions | `frontend/src/pages/CategoriesPage.jsx` | `libs/feature/categories/src/lib/*` | M |

Acceptance criteria:
- Category CRUD works.
- Subcategory add/delete works in expanded category sections.

### Phase 6: Reports

| ID | Status | Task | Source parity | Target files | Est. |
|---|---|---|---|---|---|
| MB-601 | [ ] | Create reports service (`summary`, `export`, `import`) | `frontend/src/pages/ReportsPage.jsx` | `libs/data-access/reports/*` | M |
| MB-602 | [ ] | Migrate period tabs and summary cards | `frontend/src/pages/ReportsPage.jsx` | `libs/feature/reports/src/lib/reports-page.component.ts` | M |
| MB-603 | [ ] | Migrate charts and detailed category breakdown | `frontend/src/pages/ReportsPage.jsx` | `libs/feature/reports/src/lib/*` | M |
| MB-604 | [ ] | Migrate CSV export date range flow | `frontend/src/pages/ReportsPage.jsx` | `libs/feature/reports/src/lib/reports-export.component.ts` | M |
| MB-605 | [ ] | Migrate CSV paste import flow with error summary | `frontend/src/pages/ReportsPage.jsx` | `libs/feature/reports/src/lib/reports-import.component.ts` | M |

Acceptance criteria:
- Summary changes with selected period.
- Export downloads CSV file.
- Import reports imported row count and errors.

### Phase 7: Settings and Currency Converter

| ID | Status | Task | Source parity | Target files | Est. |
|---|---|---|---|---|---|
| MB-701 | [ ] | Create settings/profile service (`PUT /api/auth/profile`) | `frontend/src/pages/SettingsPage.jsx` | `libs/data-access/auth/*` | S |
| MB-702 | [ ] | Migrate profile settings form | `frontend/src/pages/SettingsPage.jsx` | `libs/feature/settings/src/lib/settings-page.component.ts` | M |
| MB-703 | [ ] | Add currency conversion service and converter widget | `frontend/src/pages/SettingsPage.jsx` | `libs/data-access/currency/*`, `libs/feature/settings/src/lib/currency-converter.component.ts` | M |

Acceptance criteria:
- Profile update reflects in user state.
- Currency converter request/response behavior matches existing app.

### Phase 8: Test, CI, and Cutover

| ID | Status | Task | Target files | Est. |
|---|---|---|---|---|
| MB-801 | [ ] | Add unit tests for auth, expenses, categories, reports services | `libs/data-access/**` | M |
| MB-802 | [ ] | Add component tests for core pages/forms | `libs/feature/**` | M |
| MB-803 | [ ] | Add or update e2e flows for critical journeys | `expenseTrack_ui/e2e/**` | M |
| MB-804 | [ ] | Validate CI pipeline and fix flaky tests | `expenseTrack_ui/.github/workflows/ci.yml` | S |
| MB-805 | [ ] | Remove React frontend dependency from delivery path after parity sign-off | repo-level docs/scripts | S |

Acceptance criteria:
- `nx run-many -t lint test build e2e` passes in CI.
- Stakeholder sign-off on parity checklist.

## 7. Suggested Execution Sequence (Practical)

1. Phase 0 + Phase 1 first (unblocks all protected features).
2. Phase 2 shell/layout immediately after auth.
3. Phase 4 + Phase 5 (core data entry and taxonomy).
4. Phase 3 (dashboard) and Phase 6 (reports).
5. Phase 7 settings/converter.
6. Phase 8 hardening and cutover.

## 8. Risks and Mitigations

- Browser API mismatch (`window`, file download): guard browser-only logic with platform checks.
- Chart parity risk from library differences: select chart library once and reuse across dashboard/reports.
- Over-migrating UI primitives: migrate only used controls first, expand later.
- Auth/session drift: centralize credentials handling in one interceptor and one auth service.

## 9. Bootstrap Commands (Reference)

Run from `expenseTrack_ui`:

```bash
npx nx g @nx/angular:library data-access-auth --directory=libs/data-access --standalone
npx nx g @nx/angular:library data-access-expenses --directory=libs/data-access --standalone
npx nx g @nx/angular:library data-access-categories --directory=libs/data-access --standalone
npx nx g @nx/angular:library data-access-reports --directory=libs/data-access --standalone
npx nx g @nx/angular:library data-access-currency --directory=libs/data-access --standalone
npx nx g @nx/angular:library feature-auth --directory=libs/feature --standalone
npx nx g @nx/angular:library feature-dashboard --directory=libs/feature --standalone
npx nx g @nx/angular:library feature-expenses --directory=libs/feature --standalone
npx nx g @nx/angular:library feature-categories --directory=libs/feature --standalone
npx nx g @nx/angular:library feature-reports --directory=libs/feature --standalone
npx nx g @nx/angular:library feature-settings --directory=libs/feature --standalone
npx nx g @nx/angular:library feature-landing --directory=libs/feature --standalone
npx nx g @nx/angular:library ui-layout --directory=libs/ui --standalone
npx nx g @nx/angular:library ui-shared --directory=libs/ui --standalone
npx nx g @nx/angular:library util-models --directory=libs/util --standalone
```

## 10. Parity Checklist (Final Sign-Off)

- [ ] Landing page and CTA navigation parity
- [ ] Login/register/logout/session guard parity
- [ ] Dashboard stats/charts parity
- [ ] Expenses CRUD and filtering parity
- [ ] Categories/subcategories management parity
- [ ] Reports overview/export/import parity
- [ ] Settings/profile/currency converter parity
- [ ] CI green and e2e critical journeys passing
