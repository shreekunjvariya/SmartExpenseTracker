# ExpenseTrack Monorepo

This repository contains one backend service and two frontend codebases:

- `backend`: FastAPI + MongoDB API for auth, categories, expenses, reports, currencies, dashboard.
- `expenseTrack_ui`: Angular 21 (Nx workspace) UI, currently the primary migration target.
- `frontend`: Legacy React UI (kept for parity/reference during migration).

## Repository Layout

```text
ExpenseTrack/
├─ backend/
│  ├─ server.py
│  ├─ requirements.txt
│  └─ .env
├─ expenseTrack_ui/
│  ├─ src/app/
│  │  ├─ core/                 # auth guard + HTTP interceptor
│  │  ├─ libs/
│  │  │  ├─ data-access/       # API services
│  │  │  ├─ feature/           # page components
│  │  │  ├─ layout/            # protected shell + sidebar
│  │  │  └─ shared/            # reusable UI components + constants
│  │  ├─ app.module.ts
│  │  ├─ app.routes.ts
│  │  └─ app.ts
│  ├─ src/models/index.ts
│  └─ package.json
├─ frontend/
│  ├─ src/pages/               # legacy React pages
│  ├─ src/components/
│  └─ package.json
├─ design_guidelines.json
├─ auth_testing.md
└─ test_result.md
```

## Architecture Overview

1. UI authenticates with `POST /api/auth/login` or `POST /api/auth/register`.
2. Backend returns JWT and also sets `session_token` cookie.
3. Angular interceptor (`expenseTrack_ui/src/app/core/interceptors/auth.interceptor.ts`) sends:
   - `Authorization: Bearer <token>` when available
   - `withCredentials: true` for cookie-based requests
4. Protected routes are guarded by `authGuard` (`expenseTrack_ui/src/app/core/guards/auth.guard.ts`).
5. Data-access services call backend endpoints and cache selected responses (short TTL).

## Backend Service (`backend`)

### Stack

- FastAPI
- Motor (MongoDB async driver)
- JWT (`pyjwt`)
- `bcrypt` password hashing
- Pydantic models/validation

### Main File

- `backend/server.py`: contains models, auth helpers, endpoint handlers, and app setup.

### API Surface

- Auth
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
  - `POST /api/auth/logout`
  - `PUT /api/auth/profile`
- Categories
  - `GET /api/categories`
  - `POST /api/categories`
  - `PUT /api/categories/{category_id}`
  - `DELETE /api/categories/{category_id}`
  - `POST /api/categories/{category_id}/subcategories`
  - `DELETE /api/categories/{category_id}/subcategories/{subcategory_id}`
- Expenses
  - `GET /api/expenses`
  - `POST /api/expenses`
  - `PUT /api/expenses/{expense_id}`
  - `DELETE /api/expenses/{expense_id}`
- Reports
  - `GET /api/reports/summary`
  - `GET /api/reports/export`
  - `POST /api/reports/import`
- Currency + Dashboard
  - `GET /api/currencies`
  - `GET /api/currencies/convert`
  - `GET /api/dashboard/stats`

### Backend Environment Variables

Use `backend/.env`:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=expense_tracker_db
CORS_ORIGINS=http://localhost:3000,http://localhost:4200
JWT_SECRET=replace-with-secure-secret
COOKIE_SECURE=false
COOKIE_SAMESITE=lax
```

### Run Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn server:app --reload --host 127.0.0.1 --port 8000
```

Docs: `http://localhost:8000/docs`

## Angular UI (`expenseTrack_ui`)

### Stack

- Angular 21 + Nx
- Angular Material (selected controls)
- RxJS
- Jest + Playwright (workspace setup present)

### Route Map

Defined in `expenseTrack_ui/src/app/app.routes.ts`:

- Public: `/`, `/login`, `/register`
- Protected (under `ProtectedLayoutComponent` + `authGuard`):
  - `/dashboard`
  - `/expenses`
  - `/categories`
  - `/reports`
  - `/settings`

### Feature/Service Mapping

- `libs/data-access/auth/auth.service.ts` <-> auth endpoints
- `libs/data-access/categories/categories.service.ts` <-> category endpoints
- `libs/data-access/expenses/expenses.service.ts` <-> expense endpoints
- `libs/data-access/reports/reports.service.ts` <-> report endpoints
- `libs/data-access/dashboard/dashboard.service.ts` <-> dashboard + monthly summary
- `libs/data-access/currency/currency.service.ts` <-> currency conversion

### Shared UI Components

Shared components now follow one component per file with matching files:

- `*.component.ts`
- `*.component.html`
- `*.component.scss`
- `*.component.spec.ts`

Examples:

- `libs/shared/alert-spinner/alert.component.*`
- `libs/shared/alert-spinner/spinner.component.*`
- `libs/shared/input-button/input.component.*`
- `libs/shared/input-button/button.component.*`
- `libs/shared/model-dialog/modal.component.*`
- `libs/shared/model-dialog/confirm-dialog.component.*`
- `libs/shared/card-component/card*.component.*`

### Angular Environment

- `expenseTrack_ui/src/environments/environment.ts`
- `expenseTrack_ui/src/environments/environment.development.ts`

Both currently point to:

```ts
apiBaseUrl: 'http://localhost:8000/api'
```

### Run Angular UI

```bash
cd expenseTrack_ui
npm install
npx nx serve expenseTrack_ui
```

Common tasks:

```bash
npx nx build expenseTrack_ui
npx nx test expenseTrack_ui
```

## Legacy React UI (`frontend`)

This app is still present for migration parity/reference.

### Stack

- React 19
- CRACO + Tailwind + Radix/shadcn-style UI components

### Environment

`frontend/.env` currently uses:

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

### Run React UI

```bash
cd frontend
npm install
npm start
```

## Data Models (Shared Concepts)

- User: auth/profile, preferred currency, profile type
- Category: entry type (`expense`/`income`) + optional subcategories
- Expense: amount, currency, date, entry type, category/subcategory
- Report summary: totals, by-type, by-category, daily trend

Type definitions used by Angular live in `expenseTrack_ui/src/models/index.ts`.

## Testing and Quality

### Backend

- `pytest`
- formatting/lint tools available in requirements: `black`, `isort`, `flake8`, `mypy`

### Angular (`expenseTrack_ui`)

- unit tests: Jest (`*.spec.ts`)
- e2e scaffold: Playwright (`expenseTrack_ui/e2e`)
- Nx task runner for build/test/lint targets

### React (`frontend`)

- CRA/CRACO test/build scripts (`npm test`, `npm run build`)

## Current State Notes

- Angular workspace is the active migration target from React.
- Legacy React is still useful for behavior comparison.
- Backend is single-file (`server.py`), so endpoint and helper changes are centralized there.
