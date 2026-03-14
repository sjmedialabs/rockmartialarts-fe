# Responsive UI – Mobile-first architecture

This document describes the responsive strategy and reusable components used across the application.

## Breakpoints (Tailwind)

| Prefix | Min width |
|--------|-----------|
| (default) | 0px |
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |
| 2xl | 1536px |

## Reusable components

All live under `components/layout/responsive/` and are exported from `components/layout/responsive/index.ts`.

### ResponsiveContainer

- Wraps content with `max-width` and horizontal padding.
- Props: `maxWidth` (sm | md | lg | xl | 2xl | 7xl | full), `noPadding`, `className`.
- Default padding: `px-4 sm:px-6 lg:px-8`.

### ResponsiveGrid

- Mobile-first grid: 1 column by default, more at breakpoints.
- Props: `cols` (1–4), `gap` (sm | md | lg).

### ResponsiveTable

- Wraps a `<table>` in a horizontal scroll container so wide tables don’t break layout on small screens.
- Table gets `min-w-[640px]` so it scrolls horizontally when needed.

### ResponsiveLayout

- Dashboard page wrapper: `ResponsiveContainer` + vertical padding (`py-4 sm:py-5 md:py-6`).
- Use for consistent page spacing.

### MobileSidebar

- Slide-in drawer for dashboard nav on mobile/tablet.
- Uses Sheet (left side), 280px/300px width, overlay.
- Trigger is a 48px min-height hamburger button (touch-friendly).

## Layout usage

- **Dashboard**: `DashboardLayout` wraps all dashboard pages and already uses `ResponsiveContainer` for the main content area. No need to wrap each page again unless you want a different max-width or padding.
- **Website**: Public pages use their own layout; use `ResponsiveContainer` or similar where needed.

## Best practices

1. **Touch targets**: Buttons and interactive elements should have at least 44–48px height on touch devices. Use `min-h-[48px]` where appropriate.
2. **No horizontal scroll**: Use `min-w-0` on flex/grid children and `overflow-x-auto` only for intentionally scrollable areas (e.g. tables).
3. **Stack on mobile**: Use `flex-col sm:flex-row` or `grid-cols-1 sm:grid-cols-2` so content stacks on small screens.
4. **Spacing**: Prefer `gap-4 sm:gap-6` and `p-4 sm:p-6` so spacing scales with viewport.
5. **Typography**: Use `text-xl sm:text-2xl` etc. for headings so they scale.

## Files modified (summary)

- `components/layout/responsive/*` – new responsive components
- `components/layout/DashboardLayout.tsx` – uses ResponsiveContainer, responsive padding
- `components/layout/Navbar.tsx` – uses MobileSidebar, 48px touch targets, responsive padding
- `components/layout/Sidebar.tsx` – min-height for nav items (48px), touch-manipulation
- `components/layout/Header.tsx` – responsive padding and title size, 48px buttons on mobile
- `components/dashboard/TableCard.tsx` – responsive header/filters, wrap tabs
- `app/[adminType]/dashboard/students/page.tsx` – responsive header/toolbar, table scroll
- `app/[adminType]/dashboard/page.tsx` – responsive stat grid (sm:2 cols, lg:4 cols)

## Testing viewports

- 320px, 375px (small phones)
- 768px (tablet)
- 1024px (laptop)
- 1440px (desktop)
