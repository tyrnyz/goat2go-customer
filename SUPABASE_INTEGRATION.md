# Goat2Go — Supabase Integration Summary

## What Was Done

The Goat2Go customer frontend was wired to a live Supabase backend. The app previously used hardcoded data and localStorage. It now reads products/addons from the database, creates real orders, and tracks order status via Realtime.

---

## New Files

| File | Purpose |
|------|---------|
| `client/src/lib/supabase.ts` | Supabase client instance (reads env vars) |
| `client/src/lib/menuService.ts` | `fetchProducts()` and `fetchAddons()` from Supabase |
| `client/src/lib/orderService.ts` | `placeOrder()`, `fetchOrderById()`, `fetchOrderItems()`, `fetchOrdersBySession()`, `subscribeToOrder()` |
| `client/src/types/database.ts` | TypeScript interfaces matching live DB schema (`DbProduct`, `DbAddon`, `DbOrder`, `DbOrderItem`, `DbGuestSession`) |
| `.env` | Live Supabase URL + anon key |
| `.env.example` | Template for env vars |

---

## Modified Files

### Contexts
- **`GuestSessionContext.tsx`** — On mount, checks localStorage for a saved session UUID, verifies it against Supabase `guest_sessions`, and creates a new DB row if missing. Removed `@shared/types` dependency.
- **`OrdersContext.tsx`** — Replaced localStorage read/write with `fetchOrdersBySession()`. Removed `addOrder`, `updateOrderStatus`. Added `refreshOrders()`. Now stores `DbOrder[]` instead of local `Order[]`.

### Pages
- **`Checkout.tsx`** — Replaced client-side queue number generation and localStorage order creation with `placeOrder()` call. Maps frontend discount/order type values to DB casing (`"none"→"None"`, `"dine-in"→"Dine-In"`). Navigates to `/queue-confirmation/:orderID` (numeric DB ID). Filters out cart items with non-numeric IDs before submitting (guards against NaN productID crash). Alerts "No valid items to order" if all items are filtered. Error alert uses `JSON.stringify` for non-Error Supabase errors.
- **`Menu.tsx`** — Added async loading via `loadMenuFromSupabase()`. Shows skeleton placeholder while loading. Falls back to hardcoded data on error. Replaced static helper function calls with local state filtering.
- **`Home.tsx`** — Added same async loading pattern for best sellers and explore sections.
- **`QueueConfirmation.tsx`** — Reads numeric `orderId` from URL. Fetches order via `fetchOrderById()`. Subscribes to Realtime updates via `subscribeToOrder()`. Unsubscribes on unmount.
- **`Receipt.tsx`** — Fetches order and items directly from Supabase. Joins with `products` table for item names. Computes subtotal, discount, and total from fetched data.
- **`MyOrders.tsx`** — Fetches orders directly via `fetchOrdersBySession()`. Updated status values to match DB (`"Pending"` / `"Completed"`).

### Library
- **`menuData.ts`** — Added `LOCAL_IMAGE_MAP`, `DESCRIPTION_MAP`, `BEST_SELLERS`, `mapDbProductToMenuItem()`, and `loadMenuFromSupabase()`. Renamed `menuItems` to `fallbackMenuItems` (with alias kept for compatibility). Special-cases `Leche Flan` and `Turon` as `dessert` category regardless of DB type. All fallback item IDs updated to match live DB `productID` values so `parseInt(itemId)` is always valid at checkout. Three items not yet in the DB keep non-numeric IDs and are silently skipped at order time: Kampukan (`"item-7b"`), Canned Soda (`"item-42"`), Mountain Dew (`"item-44"`).

### Components
- **`CartSidebar.tsx`** — `hasVariants()` now checks `item.selectedVariant !== undefined` instead of hardcoded `"item-42"` ID.

### Routing
- **`App.tsx`** — Route changed from `/queue-confirmation/:queueNumber` to `/queue-confirmation/:orderId`. Removed dead `@shared/const` exports and `getLoginUrl`.

---

## Deleted Files

- `client/src/const.ts` — Re-exported from `@shared/const` (OAuth logic, dead code).

---

## Key Design Decisions

- **Images stay local** — `image_path` from the DB is ignored. All images are served from `client/public/`.
- **Cart stays in localStorage** — `CartContext` was not modified.
- **Descriptions and best-seller flags are hardcoded** — The DB has no columns for these.
- **Fallback on fetch failure** — If Supabase is unreachable, the menu falls back to hardcoded data silently.
- **Queue number from DB trigger** — Never generated client-side. The DB auto-assigns it on order insert.
- **Staff-side fields never set from frontend** — `status`, `paymentstatus`, `completeTimestamp`, `userID` are all staff-only.
- **Fallback IDs match DB productIDs** — `fallbackMenuItems` use numeric string IDs (e.g. `"18"` for Kare-Kare) so `parseInt` never returns NaN when submitting an order, whether the menu was loaded from Supabase or from the fallback.

---

## Known Limitations

- **Kampukan, Canned Soda, Mountain Dew** are not yet in the DB. They display in the menu (from fallback) but cannot be ordered — they are silently dropped at checkout.
- **DB name discrepancies** — The DB stores `"Chopsuey"` (not `"Chopseuy"`) and `"Papaitam Kambing"` (not `"Papaitan Kambing"`). The fallback still uses the old spellings; image/description lookups for these items when loaded from Supabase will fall back to the default placeholder.

---

## Environment

```
VITE_SUPABASE_URL=https://fbhwppufqazydeivqeez.supabase.co
VITE_SUPABASE_ANON_KEY=<your anon key>
```

`.env` is gitignored. `.env.example` is committed as a template.

---

## Build Status

- `npx tsc --noEmit` — ✅ Clean
- `npm run build` — ✅ Clean (1681 modules)
