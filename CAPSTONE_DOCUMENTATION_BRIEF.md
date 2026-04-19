# Goat2Go Customer Module — Documentation Handoff Brief

**Purpose of this file:** This is a self-contained brief for a future Claude conversation that will help Ty write four capstone documents (SDD, SRSS, STD, SPMP) plus a project handoff doc. It captures every architectural decision, security choice, feature, validation, test result, and rationale that the documentation needs. Read this file once at the start of the next conversation, then use it as the authoritative source. Do not re-query the Supabase database or re-read source files unless the brief is unclear about a specific detail. The brief was assembled after a multi-day audit verified everything against the live database, then updated on April 10, 2026 to correct four inaccuracies found when cross-checking against the actual dev branch.

**Last updated:** April 10, 2026, after the final accuracy pass correcting Ready-status frontend claims, the Receipt.tsx product name approach, and confirming the Ready status was dropped from the DB constraint and data.

**Status:** Lock-ready. Code, schema, and database state are all final. Only documentation work remains.

---

## Section 0: How to use this brief

**Read order for the next conversation:**
1. Section 1 (Project snapshot) — orient yourself
2. Section 11 (Document writing guide) — see what you're producing
3. Whichever architecture/feature/security sections the current document needs

**What to do:**
- Write the documents using only the content in this brief, plus Ty's preferences and any uploaded files.
- Treat this brief as authoritative for all factual claims about the system. The audit verified everything against the live database.
- When in doubt about a fact, ask Ty rather than guessing or querying the DB.
- If Ty asks you to do additional code or DB work in the next conversation, the rules from the previous conversation still apply: customer module only, no destructive ops on production, branches if you need to test risky changes, never push to GitHub (Ty pushes manually).

**What NOT to do:**
- Do NOT re-run the audit. It's done.
- Do NOT re-read every source file. The brief tells you what each file does.
- Do NOT mention the truncate incident from the previous conversation. It happened to synthetic test data, was reseeded immediately, has no bearing on the architecture or the defense, and Ty does not want it in the docs.
- Do NOT add content about SE2's internal systems. The customer module is the deliverable.
- Do NOT pad the documents with filler. Ty prefers minimal, professional prose with no decorative formatting.

**Ty's style preferences (apply to every document):**
- No em-dashes (use commas, periods, or parentheses instead).
- No taglish (English only).
- Minimal markdown formatting in prose: no decorative emoji, no excessive headers, no bullet-point sprawl.
- Tables and bullets are fine when they genuinely improve clarity (specs, requirement lists, test cases).
- Professional but plain. No hype words like "robust", "seamless", "cutting-edge".
- When describing decisions, lead with what was done, then why.
- Acceptance criteria for "done": each document is technically accurate, defensible at a capstone panel, and matches the actual implemented system.

---

## Section 1: Project snapshot

**Project name:** Goat2Go

**What it is:** A mobile-first web application that allows customers at Tatuns Kambingan (a Filipino restaurant in Tarlac City, Philippines) to scan a table QR code, browse the menu, build an order with optional add-ons, choose Dine-In or Take-Out, apply a PWD or Senior discount, place the order, receive a queue number, track order status, and self-cancel orders that have not yet been started by staff.

**Who built it:** Tyrone Yazon (tyrnyz on GitHub, tyroneyazon@gmail.com). Capstone project, single-developer customer module. Ty is the only person who commits and pushes to the repository.

**Repository:** github.com/tyrnyz/goat2go-customer-app

**Project boundary (critical for documentation):** Goat2Go is the customer-facing ordering module only. A separate team ("SE2 team") owns and maintains the staff Point of Sale and admin dashboard. Both modules share the same Supabase database. Goat2Go's responsibility ends at order placement and order tracking. Payment collection, order preparation workflow, staff authentication, and admin functions are entirely SE2's responsibility. The two modules communicate through the shared `orders` table: Goat2Go writes orders, SE2 reads them and updates status as the order progresses.

**Documentation should describe Goat2Go only.** Mention SE2 only when explaining the integration boundary or shared database concerns.

**Current status (April 10, 2026):** Approximately 95% complete. All assessment items shipped. Cancellation feature shipped April 8. Final validation hardening pass shipped April 9. Code and database are lock-ready. Manual testing and deployment to Cloudflare Pages are the only remaining engineering tasks. Documentation (the four required documents plus a handoff doc) is the immediate next deliverable.

**Restaurant context:** Tatuns Kambingan specializes in authentic Filipino goat meat dishes (Kaldereta, Kampukan, Papaitan) plus other Filipino comfort food. Located in Tarlac City. Operating hours: Monday-Saturday 9:00 AM-3:00 PM, closed Sunday. Single restaurant, no chain.

---

## Section 2: Architecture overview

### 2.1 Stack

**Frontend:**
- Vite (build tool)
- React 18 (UI library)
- TypeScript (language)
- Tailwind CSS (styling)
- wouter (routing, lightweight alternative to React Router)
- shadcn/ui (only the Button and Card components are used; the rest of the library was removed during cleanup)
- lucide-react (icon library)
- @supabase/supabase-js v2 (Supabase JavaScript client)

**Backend:**
- Supabase (Postgres + auto-generated REST + RLS)
- Project ID: `ovucquikswfdlexjrdai`
- URL: `https://ovucquikswfdlexjrdai.supabase.co`
- Free tier
- Shared with the SE2 team (single database, two modules)

**Storage:**
- Supabase Storage bucket `product-images` (public bucket, contains product photos)

**Hosting (planned, not yet deployed):**
- Cloudflare Pages (free tier)
- Static SPA build output: `dist/`
- Build command: `npm run build`
- Required environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Auto-deploy from `main` branch

### 2.2 Project structure

Flat SPA layout, no monorepo:

```
goat2go-customer-app/
├── client/
│   └── src/
│       ├── App.tsx                       Root component, sets up providers and routes
│       ├── main.tsx                      Entry point
│       ├── index.css                     Global styles, brand color variables
│       ├── components/                   Reusable UI components
│       │   ├── Header.tsx                Top nav with mobile drawer
│       │   ├── CartSidebar.tsx           Slide-in cart panel
│       │   ├── ItemDetailsModal.tsx      Product detail modal with addon selection
│       │   ├── MenuItemCard.tsx          Product card grid item
│       │   ├── ErrorBoundary.tsx         React error boundary
│       │   └── ui/
│       │       ├── button.tsx            shadcn Button
│       │       └── card.tsx              shadcn Card
│       ├── contexts/
│       │   ├── CartContext.tsx           Cart state, persisted to localStorage
│       │   └── GuestSessionContext.tsx   Anonymous session UUID lifecycle
│       ├── lib/
│       │   ├── supabase.ts               Supabase client init
│       │   ├── menuData.ts               Product type definitions, category mapping
│       │   ├── menuService.ts            Product/addon/best-seller fetchers
│       │   ├── orderService.ts           All order RPCs (place, fetch, cancel)
│       │   ├── orderStatus.ts            Status display helpers (color, icon, label)
│       │   └── utils.ts                  cn() class merger
│       ├── pages/
│       │   ├── Home.tsx                  Landing page with best sellers
│       │   ├── Menu.tsx                  Full menu with category nav
│       │   ├── OrderType.tsx             Dine-In vs Take-Out selector
│       │   ├── Checkout.tsx              Cart review, discount selection, place order
│       │   ├── QueueConfirmation.tsx     Post-order confirmation with queue number
│       │   ├── Receipt.tsx               Detailed receipt view
│       │   ├── MyOrders.tsx              Order history for the current session
│       │   ├── Contact.tsx               Restaurant info, map
│       │   ├── About.tsx                 Restaurant story
│       │   └── NotFound.tsx              404
│       └── types/
│           └── database.ts               TypeScript interfaces matching Supabase schema
├── public/
│   └── other_images/                     Logo and welcome background
├── package.json
├── vite.config.ts
└── tsconfig.json
```

**Cart is local-only.** Cart state lives entirely in `localStorage` and is never synced to the database. The only time cart data reaches the backend is at the moment the customer taps "Place Order", which calls the `place_customer_order` RPC with the cart contents as a JSONB array.

### 2.3 Why Vite + React + Supabase (decisions to defend)

**Vite over Create React App:** Faster dev server startup, modern ESM-first build, smaller production bundles. Vite was the obvious choice for a 2025-2026 React project; CRA is effectively deprecated.

**React over Vue/Svelte:** Largest ecosystem, most familiar to Ty, easiest hiring/maintenance handoff for the restaurant or any future developer. No requirement justified picking a less-mainstream framework.

**TypeScript over JavaScript:** Catches type errors at compile time, particularly important when the data shape comes from a shared database where column names are camelCase (e.g., `productID`, `sessionID`) and case-sensitive. The TypeScript interfaces in `types/database.ts` mirror the schema exactly and prevent mistakes that would otherwise only surface at runtime.

**Tailwind over CSS modules / styled-components:** Utility-first approach works well for a small team and a small UI surface. The brand color variables are defined once in `index.css` (`--primary: #6a1b1a`, `--secondary: #f4c27a`, etc.) and consumed via Tailwind's theme system. No custom design system was needed for a single-restaurant ordering app.

**wouter over React Router:** wouter is roughly 1.5KB versus React Router's 10KB+. The customer app has 9 routes, none of which need React Router's advanced features (loaders, nested layouts, data routers). Smaller bundle means faster load on mobile, which matters because customers are scanning a QR code at a table on a phone, often on cellular.

**shadcn/ui (Button and Card only):** Started with the full shadcn library, but the audit revealed only Button and Card were actually used. The rest were removed during cleanup to shrink the bundle. The decision to use shadcn at all is defensible because Button and Card give consistent styling primitives without the overhead of a full component library like MUI.

**Supabase over Firebase/custom backend:** Postgres-backed (familiar relational model, real foreign keys, real constraints, real RLS), generous free tier, auto-generated REST API removes the need to write a backend service, JS client handles auth flows. Critically, Supabase's Row Level Security model maps cleanly onto the shared-database integration with the SE2 team: anon role for customers, authenticated role for staff, RLS policies enforce isolation. A custom backend would have required coordinating two services on top of coordinating the shared schema.

**Cloudflare Pages over Vercel/Netlify:** Free tier with no bandwidth caps, no project pausing, fastest global CDN, custom domain support included free. The customer app is a static SPA with no server functions, so any of the three would work, but Cloudflare's bandwidth policy is the most restaurant-friendly if Tatuns ever sees real traffic.

### 2.4 The integration boundary with SE2

The shared Supabase database has 7 tables in the public schema. Goat2Go reads from and writes to a subset:

| Table | Owned by | Goat2Go's interaction |
|---|---|---|
| `products` | SE2 (created), shared | SELECT only (for menu display) |
| `addons` | Goat2Go added | SELECT only (for menu display); INSERT/UPDATE/DELETE done by SE2 admin if needed |
| `guest_sessions` | Goat2Go added | INSERT only (anon creates); SELECT goes through `verify_guest_session` RPC |
| `orders` | SE2 (created), Goat2Go added new columns | INSERT via `place_customer_order` RPC; SELECT via session-scoped RPCs; UPDATE only via `cancel_customer_order` RPC |
| `order_items` | SE2 (created), Goat2Go added `selectedAddons` and `productName` columns | INSERT only (atomically with parent order via RPC); SELECT via session-scoped RPC |
| `users` | SE2 | Goat2Go does not touch (staff users) |
| `payments` | SE2 | Goat2Go does not touch (staff records payments after collection) |

**Communication contract:**
1. Customer places an order through Goat2Go. Goat2Go inserts a row into `orders` with `sessionID IS NOT NULL`, plus rows in `order_items`. Status starts as `'Pending'`, paymentstatus as `'Unpaid'`.
2. SE2's POS queries `orders WHERE sessionID IS NOT NULL AND status != 'Cancelled'` to populate the staff order board, showing the queue number for staff to call out.
3. SE2 updates the order through their normal POS workflow: status moves Pending to Preparing to Completed, paymentstatus moves Unpaid to Paid, `userID` is set to the cashier, `completeTimestamp` is set, a row is inserted into `payments`.
4. Goat2Go polls the order every 5 seconds via `fetch_customer_order_by_id` and updates the customer-facing UI as the status changes.
5. If the customer self-cancels while the order is still Pending, Goat2Go atomically moves the order to `status='Cancelled'`, sets `cancelled_at` and `cancelled_by='customer'`. SE2's POS queries are expected to filter out cancelled orders from active queues.

**Data shape contract:** Goat2Go added five new columns to `orders` (`sessionID`, `queueNumber`, `discountType`, `cancelled_at`, `cancelled_by`), two new columns to `order_items` (`selectedAddons`, `productName`), and two new columns to `products` (`description`, `is_best_seller`). All of these are nullable and have safe defaults so SE2's existing INSERT statements continue to work without modification. The `cancellation_reason` column was added on April 8 and dropped on April 9 because nothing ever wrote to it.

---

## Section 3: Database state (authoritative as of April 10, 2026)

This section is the source of truth for the schema. The next conversation should not need to query the database for any of these details.

### 3.1 Tables Goat2Go interacts with

**`orders`**

| Column | Type | Default | Notes |
|---|---|---|---|
| `orderID` | bigint | (sequence) | PK |
| `sessionID` | uuid | NULL | Goat2Go added. Links order to a guest session. NULL for staff-created orders. |
| `orderType` | varchar | NULL | CHECK: 'Dine-In', 'Take-Out', or '' (empty string for staff) |
| `status` | varchar | 'Pending' | CHECK: 'Pending', 'Preparing', 'Completed', 'Cancelled' |
| `orderTimestamp` | timestamptz | now() | |
| `completeTimestamp` | timestamptz | NULL | Set by staff when order is completed |
| `paymentstatus` | varchar | 'Unpaid' | CHECK: 'Paid', 'Unpaid'. Note: column is lowercase, not camelCase. |
| `queueNumber` | text | NULL | Goat2Go added. Auto-generated by trigger when sessionID is not null. Format: 'Q-001'. Resets daily. |
| `discountType` | varchar | 'None' | Goat2Go added. CHECK: 'None', 'PWD', 'Senior' |
| `cancelled_at` | timestamptz | NULL | Goat2Go added (April 8). Set when order is cancelled. |
| `cancelled_by` | text | NULL | Goat2Go added (April 8). CHECK: NULL or one of 'customer', 'staff', 'system'. |

Constraints on orders:
- `chk_orders_status`: status IN ('Pending', 'Preparing', 'Completed', 'Cancelled')
- `chk_orders_ordertype`: orderType IN ('Dine-In', 'Take-Out', '')
- `chk_orders_paymentstatus`: paymentstatus IN ('Paid', 'Unpaid')
- `chk_orders_discounttype`: discountType IN ('None', 'PWD', 'Senior')
- `orders_cancelled_by_check`: cancelled_by IS NULL OR cancelled_by IN ('customer', 'staff', 'system')


**`order_items`**

| Column | Type | Default | Notes |
|---|---|---|---|
| `orderItemID` | bigint | (sequence) | PK |
| `orderID` | bigint | NULL | FK to orders |
| `productID` | bigint | NULL | Logical product ID, may change as products are versioned |
| `product_sid` | bigint | NULL | The actual versioned product reference (immutable). FK to products(product_sid). |
| `productName` | varchar | (none) | Goat2Go added. Snapshot of product name at order creation time. |
| `quantity` | integer | NULL | Validated 1-99 by `place_customer_order` RPC |
| `price` | double precision | NULL | Server-sourced from products table at order creation, NOT trusted from client |
| `selectedAddons` | jsonb | '[]' | Goat2Go added. Array of `{id, name, price}` objects. |

**`guest_sessions`**

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | uuid | gen_random_uuid() | PK |
| `created_at` | timestamptz | now() | |
| `expires_at` | timestamptz | now() + interval '24 hours' | Enforced by `verify_guest_session` RPC |

**`addons`** (Goat2Go owns this table; SE2 admin can manage it)

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | text | (none) | PK, e.g. 'addon-rice' |
| `name` | text | (none) | Display name |
| `price` | double precision | 0 | Add-on price in PHP |
| `is_available` | boolean | true | |

Current addons (4 total): `addon-rice` (Extra Rice P30), `addon-sauce` (Extra Sauce P15), `addon-no-msg` (No MSG P0), `addon-spicy` (Extra Spicy P0).

**`products`** (SE2 owns; Goat2Go reads and added two columns)

Goat2Go added `description` (text, nullable) and `is_best_seller` (boolean, default false). The full table has many more columns; the ones Goat2Go cares about:
- `productID` (bigint, the logical product ID)
- `product_sid` (bigint, the versioned/immutable PK)
- `productName` (varchar)
- `price` (double precision)
- `status` (varchar, 'AVAILABLE' or 'UNAVAILABLE')
- `type` (varchar, 'Vegetable', 'Meat', 'Fish', 'Drinks', 'Others')
- `image_path` (text, key in the product-images Storage bucket)
- `is_current` (boolean, true for the current version of a versioned product)
- `description` (text, Goat2Go added)
- `is_best_seller` (boolean, Goat2Go added)

### 3.2 Data state (real numbers)

As of April 10, 2026 (live counts — will grow during manual testing):
- `orders`: 126 rows
- `order_items`: 294 rows
- `payments`: 97 rows (only Paid orders have payments)
- `guest_sessions`: 79 rows
- `addons`: 4 rows
- `products`: 44 rows current and available

Order status distribution:
- Completed: 92
- Pending: 13
- Preparing: 5
- Cancelled: 16 (11 by customer, 5 by staff)

Sequence values and queue numbers will continue incrementing during manual testing. Do not rely on specific orderID or queue number values in the documentation.

### 3.3 Triggers

`trg_set_queue_number` is a BEFORE INSERT trigger on `orders` that calls `set_queue_number()`. The trigger only generates a queue number when `NEW.sessionID IS NOT NULL`, so staff-created orders are unaffected.

### 3.4 Row Level Security state

RLS is enabled on all relevant tables (orders, order_items, guest_sessions, addons, products, users, payments).

**Anon role policies (Goat2Go's customer role):**
- `products`: SELECT (read menu)
- `addons`: SELECT (read add-ons)
- `guest_sessions`: INSERT only (no SELECT)
- `orders`: INSERT only (no SELECT, UPDATE, or DELETE)
- `order_items`: INSERT only (no SELECT, UPDATE, or DELETE)

There are zero anon SELECT policies on `orders`, `order_items`, or `guest_sessions`. All customer reads of those tables go through `SECURITY DEFINER` RPC functions that verify session ownership before returning data.

**Authenticated role policies (SE2's staff role):** Full CRUD on all tables. Goat2Go does not touch these.

### 3.5 Functions (current customer-side RPCs)

All seven customer-facing RPCs are `SECURITY DEFINER` with `SET search_path TO 'public'`. All are granted `EXECUTE` to `anon` only (revoked from `authenticated` and `PUBLIC`).

**`verify_guest_session(p_session_id uuid) RETURNS json`**

```sql
CREATE OR REPLACE FUNCTION public.verify_guest_session(p_session_id uuid)
 RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE result RECORD;
BEGIN
  SELECT id INTO result FROM guest_sessions
  WHERE id = p_session_id AND expires_at > now();
  IF NOT FOUND THEN RETURN NULL; END IF;
  RETURN json_build_object('id', result.id);
END;
$function$;
```

Returns `{id: uuid}` if the session exists and has not expired, NULL otherwise. The frontend uses NULL to mean "rotate the session". Network errors are distinguished from NULL responses by the frontend so a transient failure does not cause the customer to lose their session.

**`place_customer_order(p_session_id uuid, p_order_type text, p_discount_type text, p_items jsonb) RETURNS jsonb`**

The hardened version. Validation runs before any database write:
1. Empty payload check: returns `{success: false, error: 'empty_order'}` if `p_items` is NULL, not a JSON array, or an empty array.
2. Quantity bounds check: every item's quantity must be 1-99 inclusive. Returns `{success: false, error: 'invalid_quantity', detail: '...'}` on violation.
3. Rate limit check: maximum 5 orders per session per 10 minutes. Returns `{success: false, error: 'rate_limit_exceeded'}` if exceeded.
4. Availability pre-check: every product must exist in the products table with `is_current=true`. If any product is not 'AVAILABLE', returns `{success: false, error: 'unavailable_products', products: [names]}`.
5. Order creation: inserts into orders with status='Pending', paymentstatus='Unpaid'. The trigger sets queueNumber.
6. Item insertion: for each item, looks up the real price, product_sid, and productName from the products table. Rebuilds the addons array by looking up each addon in the addons table; addons with unknown IDs or unavailable status are silently dropped.
7. Returns `{success: true, orderID: bigint, queueNumber: text}`.

```sql
CREATE OR REPLACE FUNCTION public.place_customer_order(
  p_session_id uuid,
  p_order_type text,
  p_discount_type text,
  p_items jsonb
)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  v_order RECORD;
  v_item JSONB;
  v_product RECORD;
  v_addon RECORD;
  v_addon_entry JSONB;
  v_rebuilt_addons JSONB;
  v_unavailable TEXT[];
  v_recent_count INTEGER;
  v_qty INTEGER;
BEGIN
  -- Empty payload rejection
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'empty_order');
  END IF;

  -- Quantity bounds (1..99 per item) — runs before any DB write
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_qty := COALESCE((v_item->>'quantity')::INT, 0);
    IF v_qty < 1 OR v_qty > 99 THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'invalid_quantity',
        'detail', 'Quantity must be between 1 and 99 per item'
      );
    END IF;
  END LOOP;

  -- Rate limit
  SELECT COUNT(*) INTO v_recent_count
  FROM orders
  WHERE "sessionID" = p_session_id
    AND "orderTimestamp" > (now() - interval '10 minutes');
  IF v_recent_count >= 5 THEN
    RETURN jsonb_build_object('success', false, 'error', 'rate_limit_exceeded');
  END IF;

  -- Availability pre-check
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    SELECT "productID", "productName", status INTO v_product
      FROM products
     WHERE "productID" = (v_item->>'productId')::INT
       AND is_current = true;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product ID % not found or not current', v_item->>'productId';
    END IF;
    IF v_product.status <> 'AVAILABLE' THEN
      v_unavailable := array_append(v_unavailable, v_product."productName");
    END IF;
  END LOOP;
  IF array_length(v_unavailable, 1) > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'unavailable_products',
      'products', to_jsonb(v_unavailable)
    );
  END IF;

  -- Create order
  INSERT INTO orders ("sessionID", "orderType", "discountType", status, paymentstatus)
  VALUES (p_session_id, p_order_type, p_discount_type, 'Pending', 'Unpaid')
  RETURNING * INTO v_order;

  -- Insert items with server-sourced prices, productName snapshot, and rebuilt addons
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    SELECT "productID", product_sid, "productName", price INTO v_product
      FROM products
     WHERE "productID" = (v_item->>'productId')::INT
       AND is_current = true
       AND status = 'AVAILABLE';

    v_rebuilt_addons := '[]'::JSONB;
    FOR v_addon_entry IN
      SELECT * FROM jsonb_array_elements(COALESCE(v_item->'selectedAddons', '[]'::JSONB))
    LOOP
      SELECT id, name, price INTO v_addon
        FROM addons
       WHERE id = (v_addon_entry->>'id')::text
         AND is_available = true;
      IF FOUND THEN
        v_rebuilt_addons := v_rebuilt_addons || jsonb_build_array(
          jsonb_build_object('id', v_addon.id, 'name', v_addon.name, 'price', v_addon.price)
        );
      END IF;
    END LOOP;

    INSERT INTO order_items (
      "orderID", "productID", product_sid, "productName", quantity, price, "selectedAddons"
    ) VALUES (
      v_order."orderID",
      v_product."productID",
      v_product.product_sid,
      v_product."productName",  -- snapshot, client value discarded
      (v_item->>'quantity')::INT,
      v_product.price,           -- server price, client value discarded
      v_rebuilt_addons            -- server-rebuilt, client addon prices discarded
    );
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'orderID', v_order."orderID",
    'queueNumber', v_order."queueNumber"
  );
END;
$function$;
```

**`cancel_customer_order(p_order_id bigint, p_session_id uuid) RETURNS jsonb`**

```sql
CREATE OR REPLACE FUNCTION public.cancel_customer_order(p_order_id bigint, p_session_id uuid)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_order_status TEXT;
BEGIN
  SELECT status INTO v_order_status
  FROM orders
  WHERE "orderID" = p_order_id AND "sessionID" = p_session_id;

  IF v_order_status IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_found');
  END IF;

  IF v_order_status != 'Pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'cannot_cancel');
  END IF;

  UPDATE orders
  SET status = 'Cancelled',
      cancelled_at = now(),
      cancelled_by = 'customer'
  WHERE "orderID" = p_order_id
    AND "sessionID" = p_session_id
    AND status = 'Pending';

  RETURN jsonb_build_object('success', true);
END;
$function$;
```

Verifies session ownership (returns `not_found` on session mismatch), allows cancellation only when status is exactly 'Pending' (returns `cannot_cancel` otherwise), and atomically updates status, cancelled_at, and cancelled_by in a single statement. The `WHERE status = 'Pending'` clause on the UPDATE prevents a TOCTOU race if the order moves to Preparing between the SELECT and the UPDATE.

**`fetch_customer_orders(p_session_id uuid) RETURNS SETOF orders`**

```sql
CREATE OR REPLACE FUNCTION public.fetch_customer_orders(p_session_id uuid)
 RETURNS SETOF orders LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
    SELECT * FROM orders
    WHERE "sessionID" = p_session_id
      AND "orderTimestamp" >= now() - interval '24 hours'
    ORDER BY "orderTimestamp" DESC;
END;
$function$;
```

Returns orders for the given session within the last 24 hours. The 24-hour window matches the session expiration so expired session data does not bleed through into a new session.

**`fetch_customer_order_by_id(p_order_id bigint, p_session_id uuid) RETURNS json`**

Returns the single order if and only if it belongs to the given session, NULL otherwise. Used by the polling loop in QueueConfirmation and by Receipt for the initial load.

**`fetch_customer_order_items(p_order_id bigint, p_session_id uuid) RETURNS SETOF order_items`**

Verifies the parent order belongs to the session before returning items. Returns all columns from `order_items` including `productName`. Used by Receipt to display the order line items.

**`get_best_sellers(p_limit integer DEFAULT 3) RETURNS TABLE(...)`**

Returns the top N products by quantity sold. Has two branches:
- **Fallback branch (current state):** If fewer than 10 non-cancelled orders exist with `orderTimestamp >= '2026-04-13'`, returns products flagged with `is_best_seller=true`, filtered to exclude `type='Others'`, ordered by productID.
- **Ranking branch:** Once 10+ real orders accumulate, switches to a real ranking by `SUM(quantity)` from order_items. Uses LEFT JOIN throughout so products with zero orders still appear (correctly ranked last by COALESCE).

The April 13 cutoff exists to exclude pre-launch test data from real product popularity calculations.

### 3.6 Trigger functions (INVOKER)

**`generate_queue_number() RETURNS text`**

```sql
CREATE OR REPLACE FUNCTION public.generate_queue_number()
 RETURNS text LANGUAGE plpgsql
AS $function$
DECLARE
  today date := current_date;
  seq integer;
BEGIN
  PERFORM pg_advisory_xact_lock(extract(doy from today)::int);
  SELECT COUNT(*) + 1 INTO seq
  FROM orders
  WHERE "orderTimestamp"::date = today
    AND "queueNumber" IS NOT NULL;
  RETURN 'Q-' || LPAD(seq::text, 3, '0');
END;
$function$;
```

The `pg_advisory_xact_lock` keyed on day-of-year prevents two simultaneous order inserts from receiving the same queue number. The lock is released automatically at end of transaction.

**`set_queue_number() RETURNS trigger`**

```sql
CREATE OR REPLACE FUNCTION public.set_queue_number()
 RETURNS trigger LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW."sessionID" IS NOT NULL AND NEW."queueNumber" IS NULL THEN
    NEW."queueNumber" := generate_queue_number();
  END IF;
  RETURN NEW;
END;
$function$;
```

---

## Section 4: Feature inventory

### 4.1 Customer flows

**Flow 1: Browse and add to cart**
- Customer scans QR code, lands on `/`
- Home page calls `loadMenuFromSupabase()` which fetches products, addons, and best sellers in parallel
- Best sellers section displays the top 3 (currently flagged products since the system is below the 10-real-order threshold)
- Customer taps "Order Now" or navigates to `/menu`
- Menu page displays all products grouped by category (Best Sellers, Meat, Fish, Vegetables, Dessert, Drinks, Add-ons)
- Customer taps a product → ItemDetailsModal opens → adjusts quantity, optionally selects add-ons (only Meat/Fish/Vegetables show add-on options) → "Add to Cart"
- Cart state is held in CartContext, persisted to localStorage on every change

**Flow 2: Place order**
- Customer opens cart sidebar (Header cart icon), reviews items, taps "Proceed to Checkout"
- If no order type was previously selected, redirected to `/order-type` first
- Checkout page displays order type (with "Change" button), discount selector (None/PWD/Senior), itemized order summary with subtotal/discount/total
- Customer taps "Place Order"
- Frontend calls `placeOrder()` from orderService.ts → Supabase RPC `place_customer_order` → server validates, prices, creates order atomically
- On success: cart cleared, navigate to `/queue-confirmation/:orderId`
- On error: inline red banner displays the error message

**Flow 3: Track order**
- QueueConfirmation page displays the queue number prominently, status badge, order type, time, item count, total cost
- Polls `fetch_customer_order_by_id` every 5 seconds; updates the status indicator live
- Polling stops when status reaches a terminal state (Completed or Cancelled)
- Items fetch retries on subsequent polls if the initial fetch failed
- Customer can navigate to MyOrders or Receipt at any time

**Flow 4: View receipt**
- Receipt page (`/receipt/:orderId`) displays full receipt: queue number, status, order details, line items with addons, pricing breakdown
- Product names are read directly from `item.productName`, a snapshot column on `order_items` populated at order creation time. Names remain accurate even if SE2 later renames or re-versions a product.
- Cancel button is shown only if status is Pending

**Flow 5: Order history**
- MyOrders page (`/my-orders`) displays all orders for the current session within the last 24 hours
- Polls every 5 seconds for status updates
- Filter dropdown: All / Pending / Completed / Cancelled
- "Pending" filter includes Pending and Preparing (both active from the customer's perspective)
- Each order card shows queue number, status badge, type, date, and a "View Receipt" button

**Flow 6: Self-cancel order (April 8 feature)**
- Cancel button appears on QueueConfirmation and Receipt pages, but only when status is exactly 'Pending'
- Tap → confirmation modal ("Cancel this order? This can't be undone.")
- Confirm → calls `cancelCustomerOrder()` → RPC `cancel_customer_order`
- On success: order state refreshed, banner switches to grey "Order Cancelled" treatment, queue number is shown with strikethrough, "no payment is due" copy appears
- On `cannot_cancel` error: order state is also refreshed (so the badge reflects what the server actually thinks), error message displayed
- Cancelled orders show in the "Cancelled Orders" filter on MyOrders

### 4.2 Cross-cutting features

**Anonymous session management:**
- On first app load, `GuestSessionContext` checks localStorage for an existing session UUID
- If present: calls `verify_guest_session` RPC. If RPC returns NULL (truly expired), rotates the session. If RPC errors (network issue), keeps the saved session and surfaces the error to the SessionGate UI for retry.
- If absent: generates a new UUID via `crypto.randomUUID()`, inserts into guest_sessions, saves to localStorage
- All subsequent order RPCs receive this session ID as an explicit parameter

**Session error gate:**
- `SessionGate` in App.tsx blocks rendering of routes when session creation fails
- Shows a full-screen "Unable to start your session — Refresh Page" message instead of silently continuing with an empty session ID

**Mobile navigation:**
- Header has a desktop nav (hidden on mobile) and a mobile drawer (hidden on desktop)
- Mobile drawer is a slide-down panel triggered by a hamburger icon
- Auto-closes on route change and on Escape key
- Backdrop click closes the drawer
- Cart icon is always visible alongside the hamburger so customers can reach the cart from any page

**Brand styling:**
- Primary color: `#6a1b1a` (deep burgundy)
- Secondary color: `#f4c27a` (cream gold)
- Background: `#FFF8F0` (warm cream)
- Foreground: `#2D1F1F` (dark brown)
- Defined as CSS custom properties in `index.css`, consumed via Tailwind theme tokens

**Error boundary:**
- ErrorBoundary at the root of App catches any unhandled React errors
- Displays a generic "Something went wrong — Reload Page" UI
- Errors logged to console.error for developer visibility, never shown to the user

---

## Section 5: Security model (full justification)

This section is critical for the SDD security chapter. Every decision is explained with the threat it mitigates.

### 5.1 Two-role model

**`anon` role (Goat2Go customers):**
- No authentication required
- Has SELECT on `products` and `addons` only
- Has INSERT (no SELECT) on `guest_sessions`, `orders`, `order_items`
- Has EXECUTE on the seven customer RPCs and nothing else
- Cannot read any other customer's data, cannot modify staff data, cannot bypass server-side validation

**`authenticated` role (SE2 staff):**
- SE2 owns this. Goat2Go does not touch.
- Mentioned in the SDD only for completeness in the role table.

**Why two roles instead of one:** A single role would force every customer query to either (a) trust the client-supplied session ID for filtering (insecure) or (b) require login for the customer (defeats the QR-code-and-go UX). Two roles let customers operate anonymously with hard server-side scoping while staff get full CRUD for their workflow.

### 5.2 Session scoping via SECURITY DEFINER RPCs

The anon role has zero SELECT on `orders`, `order_items`, and `guest_sessions`. All customer reads of those tables go through SECURITY DEFINER RPCs that take the session ID as an explicit parameter and filter on it internally.

**Threat mitigated:** A malicious customer cannot enumerate other customers' orders by trying random orderIDs. Even if they know an orderID, the RPC filters by `WHERE orderID = ? AND sessionID = ?` and returns NULL if the session does not match.

**Why explicit session parameter instead of headers:** Supabase JS v2 copies headers at client init time, so a per-request header for session scoping does not work reliably. Passing the session ID as an explicit RPC parameter is the correct pattern. The session ID is treated as a bearer token: anyone who has it can access that session's orders, but it is a UUID generated client-side and only stored in the customer's own localStorage, so there is no realistic exposure path.

**Why SECURITY DEFINER:** The RPCs need to bypass the anon RLS policies to read from tables that anon has no SELECT access to. SECURITY DEFINER means the function runs with the privileges of the function owner (postgres) instead of the calling role (anon). This is the standard Supabase pattern for any operation that needs to do row-level filtering server-side without granting broad SELECT.

### 5.3 Server-side validation and price protection

The `place_customer_order` RPC validates everything server-side and trusts nothing from the client:

**Quantity validation (added April 9):** 1-99 per item. Prevents negative-quantity money exploits where a malicious payload could craft an order with a near-zero or negative total.

**Empty payload rejection (added April 9):** Empty arrays, NULL, and non-array JSON are rejected with `error: 'empty_order'`. Prevents orphan order creation where an order row exists with zero items.

**Rate limiting:** 5 orders per session per 10 minutes. Prevents spam/abuse. Enforced via a COUNT query against the orders table at the start of the function.

**Server-sourced prices:** The RPC ignores the `price` field on each item in the client payload. It looks up the real price from the products table at order creation time. The same applies to add-on prices, which are looked up from the addons table and a clean JSONB array is rebuilt server-side.

**Server-sourced product name snapshot:** The RPC also ignores any `productName` in the client payload. It reads `productName` from the products table and stores it in `order_items.productName` at insertion time. Receipt.tsx then reads this snapshot directly, making the receipt permanently accurate regardless of future product renames.

**Server-sourced addon validity:** Add-ons with unknown IDs or `is_available=false` are silently dropped during the rebuild. A client that injects a fake addon with a discounted price gets nothing.

**Atomic insertion:** The order row and all order_items are inserted in a single transaction inside the function. There is no possibility of an order existing without items, and no possibility of partial-item insertion.

### 5.4 RPC grants tightening (April 9)

All seven customer RPCs are granted EXECUTE to `anon` only. The April 9 hardening pass revoked from PUBLIC and `authenticated`, leaving only `anon`.

**Threat mitigated:** Defense in depth. If the SE2 team's authenticated role were ever compromised, the customer RPCs would not provide an additional foothold.

### 5.5 search_path hardening

All seven customer SECURITY DEFINER RPCs have `SET search_path TO 'public'`. The default search path resolution for SECURITY DEFINER functions is a known attack vector.

**Threat mitigated:** Schema-injection attacks against SECURITY DEFINER functions. Setting search_path to a fixed value pins resolution and eliminates this class of attack.

### 5.6 Session expiration enforcement

`verify_guest_session` enforces `expires_at > now()` in the WHERE clause. Sessions are created with `expires_at = now() + 24 hours`. Expired sessions return NULL from verify, and the frontend then creates a fresh session.

**Threat mitigated:** Old session UUIDs sitting in localStorage for weeks/months cannot be replayed to access stale order data.

### 5.7 Polling instead of Realtime

Supabase Realtime subscriptions require the connecting role to have SELECT permission on the subscribed table. Goat2Go's anon role deliberately has no SELECT on orders, order_items, or guest_sessions. Granting SELECT just to enable Realtime would defeat the entire session-scoping model.

**Decision:** Use 5-second polling via session-scoped RPCs instead. Each poll returns only the customer's own data. The 5-second delay between staff marking an order complete and the customer seeing the update is acceptable for a restaurant queue context.

**Trade-off accepted:** Slightly higher backend load than Realtime would impose. At a single restaurant's traffic this is negligible.

### 5.8 Frontend security posture

- The Supabase JS client is initialized with the anon key only. The service role key is never used client-side.
- Environment variables are validated at startup; missing `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` throws immediately.
- ErrorBoundary catches any unhandled React errors and displays a generic message; no stack traces, Postgres error messages, or internal details are ever shown to users.
- Per-feature failures (menu load, order fetch, items fetch) show user-friendly retry buttons with generic copy, not raw error strings.

---

## Section 6: The April 9 hardening pass (full timeline)

### 6.1 Database migrations

**Migration 1: Drop legacy 3-arg `place_customer_order`**

The frontend uses the 4-arg version. The 3-arg version was an earlier iteration that was superseded but never dropped. It was still callable by the anon role and would create orphan orders with no items.

```sql
DROP FUNCTION IF EXISTS public.place_customer_order(uuid, character varying, character varying);
```

**Migration 2: Add quantity and empty-payload validation to 4-arg `place_customer_order`**

Added the empty payload check and per-item quantity bounds (1-99). See Section 3.5 for the full function body.

Verified by a 10-case fuzz suite (Section 9.1).

**Migration 3: Add `SET search_path = 'public'` to two RPCs that were missing it**

`fetch_customer_order_by_id` and `fetch_customer_order_items` were the only two customer RPCs without `SET search_path`. The April 9 migration brought them in line with the other five.

**Migration 4: Tighten EXECUTE grants on customer RPCs**

```sql
REVOKE EXECUTE ON FUNCTION public.cancel_customer_order(bigint, uuid) FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_customer_order(bigint, uuid) TO anon;
-- Same pattern for the other six RPCs
```

Verified: anon=true, authenticated=false, public=false on all seven customer RPCs.

**Migration 5: Race-proof `generate_queue_number`**

Added `pg_advisory_xact_lock(extract(doy from today)::int)`. Prevents two simultaneous order inserts on the same day from receiving the same queue number.

**Migration 6: Drop `cancellation_reason` column**

Added April 8, dropped April 9 because nothing ever wrote to it. `cancelled_at` and `cancelled_by` are retained for the audit trail.

**Migration 7 (deferred): Customer query indexes**

Indexes on `orders(sessionID, orderTimestamp DESC)`, `orders(orderTimestamp)`, and `order_items(orderID)` were evaluated and deferred. `order_items(orderID)` would be redundant with existing PK access patterns; the other two are unnecessary at current order volume. Revisit before go-live at production scale.

### 6.2 Frontend changes

**Status helpers cleanup (April 9-10):**
- `getQueueStatusLabel` in `orderStatus.ts` was collapsed to a single-line passthrough to `getStatusLabel`. The `Completed → "Ready for Pickup"` display string was removed as a leftover from an earlier design.
- `DbOrder.status` TypeScript union is `'Pending' | 'Preparing' | 'Completed' | 'Cancelled'`, matching the DB constraint exactly. The `Ready` status has been retired: removed from the DB constraint, all existing Ready rows purged, and no frontend handling exists.

**Receipt product name display (April 9-10):**
- `Receipt.tsx`: removed the post-fetch live `products` table query and the `productNames` state map entirely.
- JSX now renders `item.productName` directly, a snapshot column on `order_items` populated at order creation time by the `place_customer_order` RPC.
- The `supabase` import was removed from `Receipt.tsx` as it is no longer used.
- `DbOrderItem` in `database.ts` updated to include `productName: string`.

**Mobile navigation drawer:**
- `Header.tsx` got a hamburger menu in the mobile section
- Slide-down drawer with the four nav items (Home, Menu, My Orders, Contact) and the Order Now CTA
- Auto-closes on route change and Escape key
- Backdrop click-to-close
- Accessible: aria-label, aria-expanded, semantic button roles
- Cart icon preserved alongside the hamburger

**Take-Out button contrast:**
- `Menu.tsx` order-type modal: `text-white` changed to `text-secondary-foreground` (which is `#2D1F1F`, dark brown)

**GuestSession verify error vs null:**
- `GuestSessionContext.tsx`: now distinguishes `verifyError` from `data === null`
- On RPC error: keeps the saved session, sets `hasError`, lets SessionGate render the retry UI
- On RPC success with null result: rotates the session as before (truly expired)

**QueueConfirmation items retry:**
- The 5-second poll loop now retries `fetchOrderItems` on each tick if the previous attempt failed
- Once items load successfully, no further retries

**Cancel error refresh:**
- Both `Receipt.tsx` and `QueueConfirmation.tsx` `handleCancel` functions refresh order state in the catch block, so the badge reflects what the server actually thinks even if the cancel attempt failed

**Brand-restyled NotFound page:**
- `NotFound.tsx` rewritten to use bg-background, text-primary, the Tatuns logo, and burgundy/gold colors

**About page placeholder removal:**
- QR generation section removed entirely
- Replaced with "Visit Us in Tarlac City" card linking to /contact

**Inline error in Checkout:**
- `Checkout.tsx` `orderError` state and red banner above the Place Order button
- Both validation guard and catch block use this instead of `alert()`

**Cosmetic cleanups:**
- `ItemDetailsModal.tsx`: price displays now use `.toFixed(2)` for formatting consistency
- `CartSidebar.tsx`: removed unused `CartItem` import

### 6.3 Documentation updates

- `SECURITY_IMPLEMENTATION.md` updated with the new validation in section A2 and `cancel_customer_order` added to section B2
- `STAFF_TEAM_INTEGRATION_GUIDE.md` changelog updated with the April 9 entry
- `APRIL9_PATCH2_CHANGES.md` updated April 10 to correct the Ready-status claims and add the Receipt productName snapshot section
- Known doc gap: `STAFF_TEAM_INTEGRATION_GUIDE.md` "What Was Added to the Database" table still lists `cancellation_reason`. This is a 30-second fix Ty handles manually.

---

## Section 7: Open coordination items

**Item 1: SE2 confirmation that Ready status is fully retired**

The `Ready` status has been removed from the DB constraint and all frontend code. SE2 should be notified in writing that the status is retired so their POS does not attempt to set it (the constraint will now reject any such attempt). Document SE2's acknowledgment in the handoff doc.

**Item 2: Contact page placeholder values**

`Contact.tsx` still has placeholder phone (`+63 (123) 456-789`), email (`info@tatunsk.com`), and address (`123 Main Street, Brgy. San Nicolas, Tarlac City 2300`). Ty needs the real values from the restaurant owner before lock. If unavailable, the address line should be removed entirely (the embedded Google Maps already shows the location).

**Item 3: Three missing products**

Per the existing handoff doc, three products exist in the restaurant menu but not in the database:
- Kampukan (Meat)
- Canned Soda (Drinks, needs variants: Coke, Coke Zero, Royal, Sprite)
- Mountain Dew (Drinks)

SE2 added Canned Soda and Mountain Dew during the audit (they appear in the products table now). Kampukan is still missing. Ty should verify and update the doc.

**Item 4: Nine missing product images**

Per the existing handoff doc, nine products have no image uploaded to the `product-images` Storage bucket. The customer app shows a placeholder logo for these. SE2 needs to upload the images through the admin dashboard.

**Item 5: Cloudflare Pages deployment**

Has not been done yet. Ty needs to:
1. Resolve conflicting `package-lock.json` and `pnpm-lock.yaml` before pushing to `main`
2. Merge `dev` to `main`
3. Create a Cloudflare Pages project, connect the repo
4. Set environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
5. Build command: `npm run build`, output directory: `dist/`
6. Verify deployment at the default `*.pages.dev` URL

The default Cloudflare Pages domain is sufficient for the capstone. Custom domain is out of scope; pass that as a recommendation to the restaurant owner.

---

## Section 8: Known issues flagged to SE2 (out of Goat2Go's scope)

**Issue A: `users` table is anon-readable, including bcrypt password hashes**

The pre-existing RLS policy `"Anon can read users for login"` on the `users` table grants `SELECT` to anon with `qual: true`. The table contains `id`, `name`, `role`, `password` (bcrypt hash), `status`, and `auth_id`. Anyone with the public anon key can dump all 9 staff users with their hashes.

Threat: Offline brute force against the bcrypt hashes. Leaking staff names, roles, and statuses is also a privacy issue.

Recommended fix (for SE2): replace the policy with a SECURITY DEFINER `verify_staff_login(name, password)` RPC that does the bcrypt comparison server-side and never returns the hash.

**Issue B: Anon role has full SQL grants on every table**

SE2's grant model gives the `anon` role SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, and TRIGGER privileges on every table in the public schema. RLS is the only thing preventing catastrophe. There is no defense in depth.

Recommended fix (for SE2): explicitly REVOKE all privileges from anon at the SQL grant level, then GRANT only the specific privileges anon needs.

**Issue C: No backups on free tier**

Supabase free tier does not include automated backups or point-in-time recovery. Combined with Issue B, any destructive incident is permanent.

Recommended action (for the restaurant owner): upgrade to Supabase Pro before going live with real customer traffic.

---

## Section 9: Test evidence

### 9.1 Fuzz suite for `place_customer_order` (10 cases)

| # | Test case | Expected | Actual | Result |
|---|---|---|---|---|
| 1 | Empty items array `[]` | error: empty_order | error: empty_order | PASS |
| 2 | Quantity 0 | error: invalid_quantity | error: invalid_quantity | PASS |
| 3 | Quantity -5 (negative, money exploit) | error: invalid_quantity | error: invalid_quantity | PASS |
| 4 | Quantity 100 (just over limit) | error: invalid_quantity | error: invalid_quantity | PASS |
| 5 | Quantity 99 (max valid) | success | success, orderID returned | PASS |
| 6 | Quantity 1 (min valid) | success | success, orderID returned | PASS |
| 7 | Mixed valid + invalid (qty 2 and qty -1) | error: invalid_quantity | error: invalid_quantity | PASS |
| 8 | Missing `quantity` field entirely | error: invalid_quantity | error: invalid_quantity | PASS |
| 9 | NULL `p_items` | error: empty_order | error: empty_order | PASS |
| 10 | Non-array `p_items` (object literal) | error: empty_order | error: empty_order | PASS |

All 10 cases pass.

### 9.2 Cancel flow end-to-end (4 paths)

| # | Test case | Expected | Actual | Result |
|---|---|---|---|---|
| 1 | Place order with valid session, items | success, returns orderID + queueNumber | success | PASS |
| 2 | Cancel with wrong session UUID | error: not_found | error: not_found | PASS |
| 3 | Cancel with right session, status Pending | success | success, status='Cancelled', cancelled_by='customer', cancelled_at set | PASS |
| 4 | Double-cancel (call again on already-cancelled) | error: cannot_cancel | error: cannot_cancel | PASS |

### 9.3 Server-side price validation

A test order was placed with a deliberately wrong client-supplied price (`price: 999999`) on a real product. The `order_items` row written to the database had the real product price (60), not 999999. Server-side price lookup is functioning.

### 9.4 RLS verification

As the anon role, the following queries returned zero rows:
- `SELECT COUNT(*) FROM orders` → 0 rows visible
- `SELECT COUNT(*) FROM order_items` → 0 rows visible
- `SELECT COUNT(*) FROM guest_sessions` → 0 rows visible

### 9.5 Grant verification

After the April 9 grants tightening migration, all seven customer RPCs verified to have:
- `anon` EXECUTE: true
- `authenticated` EXECUTE: false
- `PUBLIC` EXECUTE: false

### 9.6 Manual test plan (for Ty to execute before lock)

1. Open the deployed app on a real mobile device (iPhone Safari and Android Chrome at minimum)
2. Create a session by visiting the home page
3. Browse the menu, search for a product, add multiple items to cart
4. Open cart sidebar, modify quantities, remove an item
5. Proceed to checkout, change order type, apply a discount, place the order
6. Verify queue number is displayed correctly on QueueConfirmation
7. Navigate to MyOrders, verify the new order appears
8. Open the receipt for the order, verify items, addons, pricing, product names
9. Cancel the order from the receipt page
10. Verify the cancelled order shows in the Cancelled filter
11. Place a second order and let it run; have someone with database access mark it Preparing, then Completed; verify the customer-facing UI updates within 5 seconds at each transition
12. Hit a typo'd URL, verify the brand-styled NotFound page renders
13. Force-close the browser, reopen, verify the session persists and the order history is intact
14. Try to place 6 orders rapidly to verify the rate limit kicks in on the 6th

---

## Section 10: Project management facts (for SPMP)

### 10.1 Team

- **Customer module developer:** Tyrone Yazon (single-developer module)
- **GitHub identity:** tyrnyz / tyroneyazon@gmail.com
- **Role:** Full-stack engineering, audit, security, deployment, documentation

The SE2 team is a separate group of developers working on the staff POS and admin dashboard. They are not part of the Goat2Go team for project management purposes.

### 10.2 Tools

- **Version control:** Git, GitHub
- **Branch model:** main to dev to feat/* (Ty is the gatekeeper for PRs into dev)
- **Editor:** VS Code (with Claude Code for AI-assisted development)
- **Database tooling:** Supabase MCP for schema verification and migrations
- **Documentation:** Markdown
- **Deployment:** Cloudflare Pages (planned)

### 10.3 Methodology

Ty worked in iterative phases, each ending with a commit and a verification pass against the live database. Large feature builds (the cancellation feature, the validation hardening pass) were planned as discrete units of work and shipped atomically. Documentation was updated after the fact to match the actual implementation. This approach is common for solo developer projects and is defensible.

### 10.4 Risk register (already mitigated, for the SPMP risk section)

| Risk | Mitigation |
|---|---|
| Customer can read other customers' orders | Session-scoped SECURITY DEFINER RPCs, anon has zero SELECT on orders/order_items/guest_sessions |
| Customer can modify order prices | Server-side price lookup in place_customer_order; client price field is discarded |
| Customer can inject false product names | Server-side productName snapshot from products table; client value discarded |
| Customer can spam orders | 5-orders-per-session-per-10-minutes rate limit, server-enforced |
| Customer can create orders with invalid quantities | 1-99 validation in place_customer_order, runs before any DB write |
| Two simultaneous orders get the same queue number | pg_advisory_xact_lock in generate_queue_number |
| Order placement creates orphan rows on partial failure | Atomic transaction; order and items inserted in single function call |
| Order data lost on session blip | Verify error distinguished from null result; saved session is kept on transient errors |
| Realtime would require SELECT grant on sensitive tables | 5-second polling via session-scoped RPCs instead |

### 10.5 Risk register (open/accepted, for handoff)

| Risk | Status | Owner |
|---|---|---|
| `users` table anon-readable with password hashes | Flagged to SE2 in writing | SE2 |
| Wide anon SQL grants on shared tables | Flagged to SE2 in writing | SE2 |
| No backups on free Supabase tier | Documented as operational risk | Restaurant owner (upgrade to Pro) |
| Real customer phone/email/address not yet entered in Contact page | Open coordination item | Ty / restaurant owner |
| Ready status retired: SE2 POS must not attempt to set it | Notify SE2 in writing | Ty / SE2 |

### 10.6 Schedule (for SPMP timeline section)

Key milestones:
- Initial Goat2Go scaffold and customer flows
- SE2 database integration and shared schema agreement
- Security model implementation (RLS policies, SECURITY DEFINER RPCs, session scoping)
- Cancellation feature (April 8, 2026)
- Final audit and validation hardening pass (April 9, 2026)
- Brief accuracy pass and Receipt.tsx productName rewrite (April 10, 2026)
- Documentation deliverables (in progress)
- Manual testing and Cloudflare Pages deployment (next)

### 10.7 Out of scope (for SPMP scope statement)

- Staff authentication (SE2 owns)
- Staff POS interface (SE2 owns)
- Payment collection and processing (SE2 owns)
- Inventory management (SE2 owns)
- Customer accounts (anonymous-only by design)
- Push notifications (polling is sufficient for the use case)
- Real-time order updates via Supabase Realtime (incompatible with the security model)
- Custom domain on Cloudflare Pages (default *.pages.dev domain is sufficient)
- Multi-language support (English only)
- Multi-restaurant/chain support (single restaurant only)

---

## Section 11: Document writing guide

### 11.1 SDD (Software Design Document)

**Audience:** Technical reviewers, defense panel, future developers
**Focus:** Architecture, design decisions, security model, data model, component breakdown

**Required sections:**
1. **Introduction:** purpose, scope, definitions, acronyms. Pull from Section 1.
2. **System overview:** context, SE2 boundary, high-level architecture. Pull from Section 1 and Section 2.4.
3. **Architecture:**
   - 3.1 Stack and rationale → Section 2.1, 2.3
   - 3.2 Project structure → Section 2.2
   - 3.3 Integration with SE2 → Section 2.4
4. **Data model:**
   - 4.1 Entity-relationship overview → Section 3.1
   - 4.2 Schema details → Section 3.1 (full column tables)
   - 4.3 Constraints and triggers → Section 3.1, 3.3
5. **Component design:**
   - 5.1 Frontend components → Section 2.2 plus Section 4.1
   - 5.2 Backend (RPC) interface → Section 3.5
   - 5.3 State management → Section 4.2
6. **Security design:** Pull entirely from Section 5. Cover the two-role model, session scoping, SECURITY DEFINER pattern, server-side validation (including productName snapshot), grants tightening, search_path hardening, polling decision. Each subsection should explain what was done and why.
7. **Design decisions and trade-offs:** Pull from Section 2.3 and Section 5.7. Include Section 6 as a "late-stage refinements" appendix.
8. **Appendices:** RPC reference (Section 3.5 in full), schema reference (Section 3.1 in full).

**Critical SDD content:**
- Explain WHY for every architectural decision, not just WHAT
- The security chapter should feel like a defense, not just a description
- Diagrams help: ER diagram, sequence diagram for order placement flow, deployment diagram

**Don't include:**
- Internal SE2 details beyond the integration boundary
- Filler about how "modern" or "robust" the system is
- Apologetics about deferred items (indexes); just note they were evaluated and deferred

### 11.2 SRSS (Software Requirements Specification)

**Audience:** Reviewers checking that the implementation matches the requirements
**Focus:** Functional requirements, non-functional requirements, use cases, acceptance criteria

**Required sections:**
1. **Introduction:** purpose, scope, definitions. Pull from Section 1.
2. **Overall description:** product perspective, functions, user classes, operating environment, constraints.
3. **Functional requirements:** For each customer flow in Section 4.1, write numbered requirements (FR-1, FR-2, etc.). Include all six flows and the cross-cutting features in Section 4.2.
4. **Non-functional requirements:** Performance (5-second polling), Security (server-side scoping, server-side validation, productName snapshot), Reliability (atomic orders), Usability (mobile-first), Maintainability (TypeScript types match schema).
5. **Use cases:** One use case per customer flow, each with actor, preconditions, main flow, alternate flows, postconditions.
6. **External interfaces:** user interfaces (mobile-first web), software interfaces (Supabase, SE2 integration via orders table), communications (HTTPS).
7. **Appendix:** acceptance criteria mapping.

**Critical SRSS content:**
- Number every requirement for traceability from the STD
- Make security NFRs concrete and testable (not "system shall be secure" but "system shall reject client-supplied prices and product names, sourcing both server-side")

### 11.3 STD (Software Test Document)

**Audience:** Reviewers verifying that the system was tested and works
**Focus:** Test plan, test cases, test results, traceability to requirements

**Required sections:**
1. **Introduction:** purpose, scope, references to SRSS.
2. **Test plan:** test items, approach (fuzz suite + integration testing + manual UI), environment.
3. **Test cases:** Pull from Section 9. Each case should have ID, description, preconditions, steps, expected result, actual result, status, requirement traceability.
4. **Test results:** 10/10 fuzz cases passed, 4/4 cancel flow paths verified, server-side price validation confirmed, RLS verification confirmed, grants verification confirmed.
5. **Manual test plan:** Section 9.6 directly.
6. **Traceability matrix:** Map each test to one or more SRSS requirements.

### 11.4 SPMP (Software Project Management Plan)

**Audience:** Reviewers checking that the project was managed
**Focus:** Schedule, deliverables, risks, team, methodology

**Required sections:**
1. **Introduction:** purpose, scope, definitions.
2. **Project organization:** team (Section 10.1), roles and responsibilities.
3. **Process model:** iterative, feature-by-feature shipping with verification (Section 10.3).
4. **Tools and infrastructure:** Section 10.2.
5. **Schedule:** Section 10.6.
6. **Deliverables:** customer module repository, four documents, deployed application, handoff doc.
7. **Risk management:** mitigated risks (Section 10.4), open risks (Section 10.5).
8. **Scope:** in scope (customer ordering module), out of scope (Section 10.7).
9. **Acceptance criteria:** passes manual test plan, all functional requirements satisfied, all security requirements verified, documentation complete.

### 11.5 Handoff doc (project handoff for future maintainers)

**Audience:** Whoever takes over the customer module after Ty
**Focus:** Operational knowledge, gotchas, things not obvious from the code

**Required sections:**
1. Project orientation
2. How to run locally
3. How to deploy (Section 7 Item 5)
4. Database access
5. Integration boundary with SE2 (Section 2.4)
6. Schema reference (Section 3.1)
7. RPC reference (Section 3.5)
8. Security notes (Section 5 summary + Section 8 open issues)
9. Operational risks (Section 10.5 + Section 8 Issue C)
10. Coordination items as of handoff (Section 7)
11. Where to find documentation
12. Common gotchas:
    - Column names are camelCase and case-sensitive in the SE2 schema; double-quote them in raw SQL
    - The cart is local-only; clearing browser data wipes the cart
    - Sessions expire in 24 hours; orders older than 24 hours are not visible to the customer
    - Free Supabase tier pauses after a week of inactivity; the first request after a pause may be slow or fail
    - Ty pushes commits as tyroneyazon@gmail.com; Claude Code must never push directly
    - Receipt reads product names from the order_items snapshot column, not from a live products lookup

### 11.6 Cross-document consistency

Use this brief as the single source of truth. If a prior file (`SECURITY_IMPLEMENTATION.md`, `STAFF_TEAM_INTEGRATION_GUIDE.md`) contradicts this brief on any factual point, the brief is correct (it was updated after the audit and the April 10 accuracy pass).

---

## Section 12: Quick reference for next-conversation Claude

**When Ty asks "write the SDD security chapter":** read Section 5 and Section 6, write in plain professional prose, no em-dashes, structured around threats and mitigations, with RPC bodies inline where relevant.

**When Ty asks "what's the rationale for X":** check Section 2.3 (architecture), Section 5 (security), Section 6 (hardening), Section 10.4 (mitigated risks).

**When Ty asks "what does feature Y do":** check Section 4.

**When Ty asks "what's the schema":** Section 3.1.

**When Ty asks "what are the RPC bodies":** Section 3.5.

**When Ty asks "what tests did we run":** Section 9.

**When Ty asks "what's still open":** Section 7 (coordination items) and Section 8 (SE2 items).

**When Ty asks for the SRSS requirement list:** generate from Section 4 (functional) and Section 5 (non-functional). Number them FR-N and NFR-N.

**When Ty asks for the SPMP risk register:** Section 10.4 and 10.5.

**When Ty asks what NOT to put in a document:** Section 11 for document-specific exclusions, Section 0 for universal exclusions.

---

## Section 13: Final state checklist (verified April 10, 2026)

- [x] Legacy 3-arg `place_customer_order` dropped
- [x] 4-arg `place_customer_order` validates empty payload, NULL, non-array, quantity bounds
- [x] `place_customer_order` snapshots productName from products table into order_items
- [x] All 7 customer DEFINER RPCs have `SET search_path TO 'public'`
- [x] All 7 customer RPCs are granted EXECUTE to anon only
- [x] `cancellation_reason` column dropped
- [x] `cancelled_at` and `cancelled_by` columns present and populated
- [x] `generate_queue_number` race-protected with advisory lock
- [x] `get_best_sellers` ranking branch consistency fixed
- [x] RLS enabled on all customer-relevant tables
- [x] Zero anon SELECT policies on orders, order_items, guest_sessions
- [x] `trg_set_queue_number` trigger present and gates on sessionID
- [x] Cancel flow verified end-to-end: place, wrong session, right session, double cancel
- [x] Server-side price validation verified (sent 999999, written 60)
- [x] `Ready` status removed from `chk_orders_status` DB constraint and all data rows purged
- [x] `DbOrder.status` TypeScript union is 'Pending' | 'Preparing' | 'Completed' | 'Cancelled'
- [x] `getQueueStatusLabel` collapsed to passthrough; no Ready references anywhere in client/src/
- [x] MyOrders Pending filter covers Pending and Preparing
- [x] QueueConfirmation poll terminates on Completed or Cancelled
- [x] `DbOrderItem` type includes `productName: string`
- [x] Receipt reads `item.productName` directly from order_items snapshot (no live products lookup)
- [x] Mobile navigation drawer in Header
- [x] Take-Out button contrast fixed
- [x] GuestSessionContext distinguishes verify error from null
- [x] QueueConfirmation items fetch retries via poll loop
- [x] Receipt and QueueConfirmation cancel-error refresh order state
- [x] NotFound page brand-restyled with logo
- [x] About page placeholder QR section removed
- [x] Checkout uses inline error instead of alert()
- [x] ItemDetailsModal price formatting consistent
- [x] CartSidebar unused import removed
- [x] SECURITY_IMPLEMENTATION.md updated for the April 9 changes
- [x] STAFF_TEAM_INTEGRATION_GUIDE.md changelog updated
- [x] APRIL9_PATCH2_CHANGES.md updated April 10 with Ready-status correction and productName section
- [x] Database state verified: 121 orders, 286 order_items, 97 payments, 78 guest_sessions, 4 addons, 47 current available products
- [x] Addons-on-non-eligible-products data quality issue fixed (25 rows cleaned, payments recomputed)

**Open before lock (Ty handles manually):**
- [ ] Contact page real phone, email, address (or removed)
- [ ] STAFF_TEAM_INTEGRATION_GUIDE.md "What Was Added" table: remove `cancellation_reason` row
- [ ] Manual testing per Section 9.6
- [ ] Cloudflare Pages deployment per Section 7 Item 5
- [ ] Documentation: SDD, SRSS, STD, SPMP, handoff doc (the next conversation's job)
- [ ] SE2 coordination: Ready status answer, missing products verification, missing images upload
- [ ] SE2 written notice of the three security issues in Section 8

---

End of brief. This file is the corrected and authoritative version as of April 10, 2026. After reading, the next Claude should be able to write any of the four documents (or the handoff doc) without re-querying the database or re-reading the source files.
