This project is a Next.js (App Router) dashboard using TypeScript, Tailwind (v4), shadcn-style UI primitives, TanStack Query, and a Syncfusion Scheduler for managing reservations and cleanings.

## Getting Started

Install and run the development server:

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000 to view the app.

## Scheduler (Syncfusion) Setup

Install dependencies:

```bash
pnpm add @syncfusion/ej2 @syncfusion/ej2-react-schedule
```

Global CSS: the cleaner page imports the Syncfusion Material theme via `@syncfusion/ej2/material.css`. If your installed version prefers per-package CSS, swap to `@syncfusion/ej2-react-schedule/styles/material.css`.

Key files:

- `types/domain.ts`: Property, Reservation, Cleaning, Cleaner, CalendarEvent, and mapping helpers.
- `components/scheduler/Scheduler.tsx`: ScheduleComponent with Timeline views, drag/drop, resize, overlap validation, and a cleaner assignment drawer.
- `components/scheduler/mockData.ts`: Sample data for properties/reservations and auto-generated turnover cleanings.
- `components/scheduler/eventTemplate.tsx`: Custom event template for reservation vs cleaning.
- `app/(protected)/cleaner/page.tsx`: Wires the scheduler into the Protected layout.

Features:

- TimelineDay/Week/Month with virtualization enabled.
- Toggle grouping between Properties and Cleaners (row-per-resource), `byGroupID` enabled.
- Drag/drop and resize with validation to prevent overlapping cleanings on the same property or cleaner.
- Assignment drawer for reassigning cleaners.
- Legends and mock sample data included.

Performance:

- The scheduler supports virtualization. For large datasets, load events only for the current view range using the `chunkByRange` helper (see `types/domain.ts`) and the scheduler’s `dataBound`/`navigating` hooks.

Edge cases and validation:

- Back-to-back stays (cleaning slot generation immediately after checkout).
- Time zone awareness via ISO offsets. Optionally set a scheduler `timezone` or normalize inputs.

Hostfully integration:

- Types and mappers in `lib/integrations/hostfully.ts` (skeleton). Configure `HOSTFULLY_BASE_URL` and `HOSTFULLY_API_TOKEN` and implement API routes under `app/api/hostfully/*` to proxy data.

Testing suggestions:

- E2E: verify drag/drop constraints, drawer-based reassignment, back-to-back stays, and toggling between resource views. Validate rendering across DST boundaries.
