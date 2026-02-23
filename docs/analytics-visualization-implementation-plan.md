# Analytics Visualization Implementation Plan

## Goal
Add rich, real-time visual analytics for transactions with flexible period controls and filters:
- Period presets: weekly, monthly, yearly
- Custom date range
- Live search by category and transaction description/name
- Chart updates in real time as filters change

## Scope
This plan targets the Angular application in `expenseTrack_ui` and reuses the existing `/api/analytics/raw` data pipeline.

## Current Foundation
- Analytics data is already fetched from `/api/analytics/raw` and cached in `AnalyticsService`.
- Summary and dashboard stats are computed client-side via pure helpers in `analytics-calculations.ts`.
- Reports page already supports period tabs (`week`, `month`, `year`) and summary cards.

## Proposed Delivery (Milestones)

### Milestone 1 — Query Model + Filter Pipeline (Core)
**Objective:** Standardize analytics filters and build deterministic filtering utilities.

#### Work
1. Extend models:
   - Add `AnalyticsQuery` type in `expenseTrack_ui/src/models/index.ts` with:
     - `period: 'week' | 'month' | 'year' | 'custom'`
     - `startDate?: string`
     - `endDate?: string`
     - `entryTypes?: EntryType[]`
     - `categoryIds?: string[]`
     - `searchText?: string`
     - `groupBy?: 'day' | 'week' | 'month'`
2. Extend `analytics-calculations.ts`:
   - Add `filterTransactions(snapshot, query)` helper.
   - Add grouped trend helpers for day/week/month output.
   - Keep existing summary helpers backward-compatible.
3. Unit tests:
   - Add tests for combined filters and custom date boundaries.

#### Acceptance Criteria
- Filtering behavior is deterministic and test-covered.
- Existing dashboard/reports behavior remains unchanged when query not supplied.

---

### Milestone 2 — Reports Filter UX + Realtime Updates
**Objective:** Add flexible filtering controls and live updates in reports.

#### Work
1. Reports page UI (`reports-page.component.html`):
   - Add period selector with `custom` option.
   - Add date pickers when custom period is selected.
   - Add entry-type toggles (income/expense/both).
   - Add category multi-select.
   - Add debounced search input.
2. Reports page logic (`reports-page.component.ts`):
   - Track filter state with reactive forms or signal-like observable state.
   - Recompute summary and charts on each filter change.
   - Add clear/reset filters action.
3. Persistence:
   - Save/restore last-used filters in `localStorage`.

#### Acceptance Criteria
- Changing any filter updates summary/charts immediately (no full page refresh).
- Search is debounced and supports category/name matching.

---

### Milestone 3 — Multi-Chart Components
**Objective:** Provide multiple visual representations for the same filtered data.

#### Work
1. Add shared chart components under `expenseTrack_ui/src/app/libs/shared/analytics-charts/`:
   - `trend-chart` (line/bar/area)
   - `breakdown-chart` (donut/pie/horizontal bar)
2. Replace/augment current text breakdown in reports with these components.
3. Add chart-type toggles and empty/error states.

#### Acceptance Criteria
- User can switch chart types without losing selected filters.
- Charts render correctly for expense-only, income-only, and mixed data.

---

### Milestone 4 — Backend Filter Params (Scalability)
**Objective:** Add optional server-side filtering for larger datasets.

#### Work
1. Enhance `GET /api/analytics/raw` in `backend/server.py` with optional query params:
   - `start_date`, `end_date`, `entry_type`, `category_id`, `search`
2. Keep response shape/pagination compatible with existing frontend.
3. Add indexes for query paths where missing.

#### Acceptance Criteria
- Frontend can opt into server-side filtering without breaking current flow.
- Existing clients remain backward-compatible.

---

### Milestone 5 — Insights Layer (Value Add)
**Objective:** Introduce actionable insights above raw charts.

#### Work
1. Add pure helpers for:
   - Period-over-period deltas
   - Top category movers
   - Savings rate
   - Spike detection
2. Add insight cards to reports/dashboard.

#### Acceptance Criteria
- Insights are computed from the same filtered query state.
- Empty-state handling is clear and non-misleading.

## Non-Functional Requirements
- Preserve existing auth/session behavior.
- Maintain accessibility for controls/charts (labels, keyboard focus, ARIA text).
- Keep change detection stable in zone-less rendering path.
- Avoid expensive recompute loops (debounce + memoized derivations).

## Risks & Mitigations
1. **Large datasets can slow client-side filtering**
   - Mitigation: Introduce Milestone 4 server-side filtering and tighter cache keys.
2. **Chart complexity can hurt readability**
   - Mitigation: Keep defaults simple and expose advanced options progressively.
3. **Filter state can become inconsistent**
   - Mitigation: Centralize query model and normalize before compute.

## Suggested Build Order
1. Milestone 1
2. Milestone 2
3. Milestone 3
4. Milestone 4
5. Milestone 5

## Definition of Ready for Implementation
- Plan reviewed and approved.
- Priority milestones selected (recommended: 1 + 2 first PR, 3 second PR).
- Final UX decision on chart defaults and filter layout.
