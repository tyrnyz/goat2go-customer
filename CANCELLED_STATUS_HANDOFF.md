# Cancelled Order Status — Staff Team Handoff

**Date:** April 8, 2026  
**Developer:** Tyrone Yazon (tyrnyz)  
**Affects:** Customer module + shared SE2 Supabase DB (`ovucquikswfdlexjrdai`)

---

## Action Required Right Now

**Your active order board / prep queue must filter out Cancelled orders.** Without this change, cancelled orders will silently appear in the queue as if they still need to be prepared — but the customer has already been told no payment is due and will not show up to collect them.

```sql
-- Use this for your active order board / prep queue
SELECT * FROM orders
WHERE "sessionID" IS NOT NULL
  AND status != 'Cancelled'
ORDER BY "orderTimestamp" DESC;
```

Everything else in this document is informational. This filter is the only required change on your side.

---

## What Changed

Customers can now self-cancel their own order from the customer app, **but only while it is still Pending**. Once an order moves to Preparing, it can no longer be cancelled by the customer.

The `orders` table already had `'Cancelled'` in its status CHECK constraint — no constraint change was needed. Three new columns were added and a new RPC was created.

---

## Database Changes

### New Columns on `orders`

| Column | Type | Notes |
|---|---|---|
| `cancelled_at` | TIMESTAMPTZ | Set when cancelled. NULL otherwise. |
| `cancelled_by` | TEXT | Who cancelled. NULL for non-cancelled orders. See values below. |
| `cancellation_reason` | TEXT | Optional free-text reason. NULL for customer self-cancels. Intended for staff or future system use. |

**`cancelled_by` values:**
- `'customer'` — set by the `cancel_customer_order` RPC when the customer taps "Cancel" in the app
- `'staff'` — for when a staff member manually cancels an order via SQL (no automated flow exists yet)
- `'system'` — reserved for future automated cancellation (e.g. a scheduled job that voids unpaid orders after a timeout); **not currently used**

A CHECK constraint (`orders_cancelled_by_check`) enforces only these three values. Any other string will be rejected by the database.

### New RPC: `cancel_customer_order(p_order_id BIGINT, p_session_id UUID)`

- Verifies session ownership — a customer can only cancel their own order.
- Allows cancellation only when `status = 'Pending'`. Attempting to cancel a Preparing, Completed, or already-Cancelled order returns an error.
- Atomically sets `status = 'Cancelled'`, `cancelled_at = now()`, `cancelled_by = 'customer'` in a single statement — no partial state possible.
- Returns `JSONB`:
  - `{"success": true}` — cancel succeeded
  - `{"success": false, "error": "not_found"}` — order not found or session mismatch
  - `{"success": false, "error": "cannot_cancel"}` — order is not Pending
- Granted to both `anon` and `authenticated` roles.
- `SECURITY DEFINER` with fixed `search_path = 'public'` — prevents schema-injection attacks against the function's elevated privileges.

### Updated RPC: `get_best_sellers`

Added `AND o.status != 'Cancelled'` to the ranking JOIN so cancelled orders are excluded from product popularity counts. The 10-order threshold check (which determines whether enough real data exists to rank at all) is separate and intentionally includes all orders including cancelled — it only answers "is there enough data?", not "how do products rank?".

---

## Do Not Accept Payment for Cancelled Orders

The customer app shows "No payment is due" for cancelled orders. Check `status` before processing payment — a Cancelled order should never be marked Paid.

---

## Staff-Initiated Cancellation

This release only supports customer self-cancellation. If a staff member needs to cancel an order (e.g. an item became unavailable after the order moved to Preparing), run a single atomic UPDATE:

```sql
UPDATE orders
SET status              = 'Cancelled',
    cancelled_at        = now(),
    cancelled_by        = 'staff',
    cancellation_reason = 'Item unavailable'  -- set to NULL if no reason needed
WHERE "orderID" = <order_id>;
```

**Set all four columns in one statement.** If you split them across separate updates and one is missed, the audit trail will be incomplete — `cancelled_by` will be NULL even though the order is Cancelled.

The customer app detects the status change on its next poll (within 5 seconds) and updates the UI automatically. Whether the admin dashboard supports editing these columns is a separate concern — coordinate with the customer module developer if you need a UI for staff cancellation.

---

## Error Code Reference

| RPC error code | Meaning | Typical cause |
|---|---|---|
| `not_found` | Order not found or session mismatch | Wrong session, order belongs to someone else |
| `cannot_cancel` | Order is not Pending | Already Preparing, Completed, or Cancelled |

---

## Customer-Facing Behaviour

| Page | Cancelled state |
|---|---|
| QueueConfirmation | Gray banner ("Order Cancelled"), strikethrough queue number, "This order was cancelled. No payment is due.", cancel button disappears |
| Receipt | Gray banner ("Order Cancelled"), strikethrough queue number, cancellation reason row shown if set |
| MyOrders | New "Cancelled Orders" filter in dropdown; cancelled order cards are muted gray with reduced opacity |

---

## What Did Not Change

- The `orders` table CHECK constraint on `status` already included `'Cancelled'` — no constraint change was made.
- All existing `authenticated` role policies are untouched.
- Staff-created orders (where `sessionID IS NULL`) are completely unaffected.
- The queue number trigger, `place_customer_order`, `fetch_customer_orders`, and all other existing RPCs are unchanged.
