# TestFlow Main Page — Integration Guide

## What's in this package

These files implement the TestLink-style main page for the Angular project.
Drop them into `webapp/frontend/src/` at the paths shown below.

---

## File map

```
src/app/
│
├── app.component.html          ← REPLACE existing (removes old app-header)
├── app.component.ts            ← REPLACE existing (bare RouterModule shell)
├── app.routes.ts               ← REPLACE existing (adds shell + explorer routes)
│
├── core/
│   ├── models/
│   │   ├── shared.ts           ← NEW  (UserCreatedTimeStampDTO etc.)
│   │   ├── testsuite.ts        ← REPLACE existing (adds priority, description)
│   │   └── testexecution.ts    ← REPLACE existing (adds executedAt string)
│   └── services/
│       ├── context.service.ts  ← NEW  (persists project/plan selection)
│       └── tree-state.service.ts ← NEW (sidebar expand/collapse/selection)
│
├── features/
│   ├── main-layout/
│   │   ├── main-layout.component.html  ← NEW
│   │   ├── main-layout.component.scss  ← NEW
│   │   └── main-layout.component.ts    ← NEW
│   │
│   └── test-explorer/
│       ├── test-explorer.component.html  ← NEW
│       ├── test-explorer.component.scss  ← NEW
│       ├── test-explorer.component.ts    ← NEW
│       │
│       ├── suite-tree-node/
│       │   ├── suite-tree-node.component.html  ← NEW
│       │   ├── suite-tree-node.component.scss  ← NEW
│       │   └── suite-tree-node.component.ts    ← NEW
│       │
│       ├── case-table/
│       │   ├── case-table.component.html  ← NEW
│       │   ├── case-table.component.scss  ← NEW
│       │   └── case-table.component.ts    ← NEW
│       │
│       └── execution-table/
│           ├── execution-table.component.html  ← NEW
│           ├── execution-table.component.scss  ← NEW
│           └── execution-table.component.ts    ← NEW
```

---

## Routing after integration

| URL                    | What renders                              |
|------------------------|-------------------------------------------|
| `/login`               | LoginComponent (no shell)                 |
| `/`  → redirects to `/explorer` | MainLayoutComponent shell          |
| `/explorer`            | TestExplorerComponent inside shell        |
| `/projects`            | ProjectListComponent inside shell         |
| `/projects/project-key/:key/suites` | TestSuiteListComponent inside shell |
| All other existing routes | Unchanged — inside shell              |

---

## How it works

### MainLayoutComponent
- Replaces the old `AppHeaderComponent` for authenticated routes.
- Renders the **top bar** with project/plan dropdowns (context selectors).
- Renders the **sidebar** with a collapsible/searchable suite tree — but only when on the `/explorer` route. All other routes (existing deep-link pages) get full width.
- The sidebar is hidden on non-explorer routes so existing pages remain unchanged.

### ContextService
- Persists selected `projectKey` and `testPlanId` in `sessionStorage` so selections survive page refresh.
- Emits changes via `ctx$` observable; the explorer reacts automatically.

### TreeStateService
- Tracks which suite nodes are expanded and which node is currently selected.
- Shared between `MainLayoutComponent` (renders the tree) and `TestExplorerComponent` (renders the content panel based on selection).

### TestExplorerComponent
Renders one of three panels depending on `TreeStateService.selection$`:

| Selection       | Panel shown                                               |
|-----------------|-----------------------------------------------------------|
| `none`          | Plan overview: stats, progress bar, recent runs tab, all-cases tab |
| `suite`         | Suite view: sub-suite chips + sortable/filterable case table |
| `case`          | Test case detail: tabs for Details, Steps, Execution History |

### SuiteTreeNodeComponent
- Recursive self-referencing component — renders suites and their children.
- **Lazy loads** test cases for a suite only when it is first expanded (one HTTP call per suite, on demand).
- Uses `OnPush` change detection throughout for performance.

---

## Mock/fallback behaviour

Where the backend doesn't yet have an aggregate stats endpoint:
- `planStats$` is derived by loading the first test run's items and counting by status.
- `allCases$` falls back to an empty array gracefully.
- All streams use `catchError(() => of([]))` so the UI never breaks on 4xx/5xx.

---

## Dependencies required (already in project)

- `@angular/common`, `@angular/router`, `@angular/forms` — all standard Angular
- `SpinnerComponent`, `StatusBadgeComponent`, `TestRunStatusBadgeComponent` — existing shared components, unchanged
- All existing services (`TestCaseService`, `TestSuiteService`, etc.) — unchanged APIs

No new npm packages needed.
