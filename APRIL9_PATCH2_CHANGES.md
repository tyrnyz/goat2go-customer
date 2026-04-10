# Customer App — April 9, 2026 (Patch 2)

**Author:** Tyrone Yazon (customer module)

---

## 1. `Ready` status removed from customer app

**Reason:** SE2 confirmed they will not use `Ready` as a distinct order step. Orders go directly `Preparing → Completed`.

**Files changed:**

- `client/src/types/database.ts` — Removed `'Ready'` from `DbOrder.status` union type. Status is now `'Pending' | 'Preparing' | 'Completed' | 'Cancelled'`.
- `client/src/lib/orderStatus.ts` — Removed `PackageCheck` icon import (no longer used). Removed `'Ready'` from `ACTIVE_STATUSES`. Removed `Ready` cases from `getStatusColor`, `getStatusIcon`, `getStatusLabel`, and `getReceiptStatusConfig`. Collapsed `getQueueStatusLabel` to delegate entirely to `getStatusLabel` — the `Completed → "Ready for Pickup"` display string was the final Ready-related remnant and has now been removed.
- `client/src/pages/QueueConfirmation.tsx` — Removed `'Ready'` from the polling stop condition. Removed the green "Your order is ready for pickup!" UI block that was specific to `Ready` status (the `Completed` block below it already handles the pickup message).
- `client/src/pages/MyOrders.tsx` — Removed `Ready` from the "pending" status filter. Removed the green left-border override for `Ready` order cards.

**DB impact:** None. The `chk_orders_status` constraint still allows `'Ready'` at the DB level. No migration required. If an order is somehow set to `Ready`, the customer app will display it with the default pending-style badge without crashing.

---

## 2. Tatun logo added as browser tab favicon

**Reason:** The browser tab was showing a blank icon. The Tatun logo (`tatuns_logo.png`) was already in the project assets but not wired up.

**Files changed:**

- `client/index.html` — Added `<link rel="icon" href="/other_images/tatuns_logo.png" type="image/png" />` to `<head>`. Uses the existing asset at `client/public/other_images/tatuns_logo.png`.

---

## 3. Documentation updates

- `STAFF_TEAM_INTEGRATION_GUIDE.md` — Updated the QueueConfirmation changelog entry to remove mention of "Ready for Pickup" as a displayed status. Status indicator now covers Pending / Being Prepared / Completed only.
- `SE2_HANDOFF_APRIL9.md` — Replaced Section 5 ("Ready status — customer app now handles it") with a resolved note explaining that Ready has been dropped following SE2's confirmation.
- `KNOWN_ISSUES.md` — Marked Issue 3 (`chk_orders_status` / Ready usage question) as resolved with the same confirmation.

---

## 3. Receipt.tsx rewritten to use `productName` snapshot

**Reason:** `Receipt.tsx` was performing a live JOIN against the `products` table on every receipt load to resolve product names. The `order_items` table already stores a `productName` snapshot column (confirmed present in DB schema). The live lookup was unnecessary and created a dependency on the `products` table remaining intact after an order is placed.

**Files changed:**

- `client/src/types/database.ts` — Added `productName: string` to `DbOrderItem` interface to match the DB column.
- `client/src/pages/Receipt.tsx` — Removed `productNames` state, removed the `supabase` import, removed the post-fetch `products` query. Item names now render directly from `item.productName`.

**DB impact:** None. `order_items.productName` already exists and is populated at order placement time.

---

## No changes to

- Database schema, constraints, or RLS policies
- Any RPCs
- SE2-side tables, triggers, or permissions
- Any other customer app pages or services
