# Server

Backend API lives here.

## Bills Schema Decision

Ticket 29 originally described a simplified bills table using `due_month` and `due_day`. After reviewing how recurring bills need to behave in the app, the implemented schema intentionally uses `next_due_date` instead.

The current bills table stores:

- `user_id`
- `title`
- `amount`
- `next_due_date`
- `recurrence`
- `paid`
- `last_paid_at`
- `is_active`
- `created_at`
- `updated_at`

This design lets the backend treat `next_due_date` as the single source of truth for upcoming bills. When a bill is marked paid, the app can set `paid`, record `last_paid_at`, and advance `next_due_date` according to `recurrence`.

`is_active` is included so cancelled or paused recurring bills can be hidden from upcoming views without deleting the record. Payment tracking is intentionally lightweight for MVP; the app stores current payment state, not a full payment history.
