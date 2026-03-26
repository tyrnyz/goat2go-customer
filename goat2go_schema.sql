-- ============================================================================
-- GOAT2GO: CUSTOMER ORDERING SYSTEM — SUPABASE DATABASE SCHEMA
-- ============================================================================
-- Team:        ELE Blue Tribe Team (3ISA - Group 2)
-- Module:      Customer Ordering Management System
-- Backend:     Supabase (PostgreSQL + Auth + Realtime)
-- Version:     1.0
-- Date:        March 2026
--
-- HOW TO USE:
--   1. Open your Supabase project dashboard
--   2. Go to SQL Editor (left sidebar)
--   3. Click "New query"
--   4. Paste this entire file and click "Run"
--
-- NOTES:
--   - The `products` and `addons` tables are READ-ONLY for our system.
--     The other team (Staff/Admin) manages menu data. We create the tables
--     here so our foreign keys work, but we won't write to them from our app.
--   - RLS (Row Level Security) policies are included at the bottom.
--   - A queue number generator function is included.
-- ============================================================================


-- ────────────────────────────────────────────────────────────────────────────
-- 0. EXTENSIONS
-- ────────────────────────────────────────────────────────────────────────────
-- pgcrypto is enabled by default in Supabase; needed for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ────────────────────────────────────────────────────────────────────────────
-- 1. GUEST_SESSIONS
-- ────────────────────────────────────────────────────────────────────────────
-- Stores anonymous customer sessions. Created automatically when a customer
-- opens the app via QR code or direct URL. No login required.

CREATE TABLE IF NOT EXISTS guest_sessions (
  session_id    UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ     NOT NULL    DEFAULT now(),
  order_type    TEXT            CHECK (order_type IN ('Dine-In', 'Take-Out')),
  is_active     BOOLEAN         NOT NULL    DEFAULT true
);

COMMENT ON TABLE  guest_sessions              IS 'Anonymous customer sessions — one per browser tab/visit';
COMMENT ON COLUMN guest_sessions.session_id   IS 'UUID primary key, auto-generated';
COMMENT ON COLUMN guest_sessions.created_at   IS 'Timestamp when the session was created';
COMMENT ON COLUMN guest_sessions.order_type   IS 'Dine-In or Take-Out — set when customer chooses';
COMMENT ON COLUMN guest_sessions.is_active    IS 'Whether the session is still active';


-- ────────────────────────────────────────────────────────────────────────────
-- 2. PRODUCTS  (read-only for our module)
-- ────────────────────────────────────────────────────────────────────────────
-- Menu items managed by the Staff/Admin team. Our system only reads from this.

CREATE TABLE IF NOT EXISTS products (
  product_id    SERIAL          PRIMARY KEY,
  product_name  TEXT            NOT NULL,
  price         DECIMAL(10,2)   NOT NULL    CHECK (price >= 0),
  status        TEXT            NOT NULL    DEFAULT 'Available'
                                CHECK (status IN ('Available', 'Out of Stock')),
  image_path    TEXT
);

COMMENT ON TABLE  products                IS 'Menu items — managed by Staff/Admin team, read-only for Customer module';
COMMENT ON COLUMN products.product_id     IS 'Auto-incrementing PK';
COMMENT ON COLUMN products.product_name   IS 'Display name of the menu item';
COMMENT ON COLUMN products.price          IS 'Base price in PHP';
COMMENT ON COLUMN products.status         IS 'Available or Out of Stock';
COMMENT ON COLUMN products.image_path     IS 'Relative path or URL to product image';


-- ────────────────────────────────────────────────────────────────────────────
-- 3. ADDONS  (read-only for our module)
-- ────────────────────────────────────────────────────────────────────────────
-- Add-on options tied to specific products (e.g., Extra Rice, Extra Sauce).

CREATE TABLE IF NOT EXISTS addons (
  addon_id      SERIAL          PRIMARY KEY,
  product_id    INT             NOT NULL    REFERENCES products(product_id) ON DELETE CASCADE,
  addon_name    TEXT            NOT NULL,
  addon_price   DECIMAL(10,2)   NOT NULL    CHECK (addon_price >= 0),
  status        TEXT            NOT NULL    DEFAULT 'Available'
                                CHECK (status IN ('Available', 'Unavailable'))
);

COMMENT ON TABLE  addons              IS 'Product add-on options — managed by Staff/Admin team';
COMMENT ON COLUMN addons.addon_id     IS 'Auto-incrementing PK';
COMMENT ON COLUMN addons.product_id   IS 'FK to the parent product';
COMMENT ON COLUMN addons.addon_name   IS 'Name of the add-on (e.g., Extra Rice)';
COMMENT ON COLUMN addons.addon_price  IS 'Price of the add-on in PHP';
COMMENT ON COLUMN addons.status       IS 'Available or Unavailable';


-- ────────────────────────────────────────────────────────────────────────────
-- 4. ORDERS
-- ────────────────────────────────────────────────────────────────────────────
-- Central order entity. Each order belongs to a guest session and receives
-- a unique daily queue number (e.g., Q-001) upon confirmation.

CREATE TABLE IF NOT EXISTS orders (
  order_id          SERIAL          PRIMARY KEY,
  session_id        UUID            NOT NULL    REFERENCES guest_sessions(session_id) ON DELETE CASCADE,
  queue_number      VARCHAR(10),                -- Assigned at checkout (e.g., Q-001)
  order_type        TEXT            NOT NULL    CHECK (order_type IN ('Dine-In', 'Take-Out')),
  status            TEXT            NOT NULL    DEFAULT 'Pending'
                                    CHECK (status IN ('Pending', 'Preparing', 'Ready', 'Completed')),
  discount_type     TEXT            NOT NULL    DEFAULT 'None'
                                    CHECK (discount_type IN ('None', 'PWD', 'Senior')),
  order_timestamp   TIMESTAMPTZ     NOT NULL    DEFAULT now()
);

COMMENT ON TABLE  orders                    IS 'Customer orders with queue-based identification';
COMMENT ON COLUMN orders.order_id           IS 'Auto-incrementing PK';
COMMENT ON COLUMN orders.session_id         IS 'FK to the guest session that placed this order';
COMMENT ON COLUMN orders.queue_number       IS 'Unique daily queue number (Q-001, Q-002, etc.)';
COMMENT ON COLUMN orders.order_type         IS 'Dine-In or Take-Out';
COMMENT ON COLUMN orders.status             IS 'Pending → Preparing → Ready → Completed';
COMMENT ON COLUMN orders.discount_type      IS 'None, PWD, or Senior discount';
COMMENT ON COLUMN orders.order_timestamp    IS 'When the order was placed';


-- ────────────────────────────────────────────────────────────────────────────
-- 5. ORDER_ITEMS  (bridge table)
-- ────────────────────────────────────────────────────────────────────────────
-- Links orders to products. Each row is one line item with quantity,
-- snapshot price, and any selected add-ons stored as JSONB.

CREATE TABLE IF NOT EXISTS order_items (
  order_item_id     SERIAL          PRIMARY KEY,
  order_id          INT             NOT NULL    REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id        INT             NOT NULL    REFERENCES products(product_id),
  quantity          INT             NOT NULL    DEFAULT 1 CHECK (quantity > 0),
  price             DECIMAL(10,2)   NOT NULL    CHECK (price >= 0),
  selected_addons   JSONB           NOT NULL    DEFAULT '[]'::jsonb
);

COMMENT ON TABLE  order_items                   IS 'Individual line items within an order';
COMMENT ON COLUMN order_items.order_item_id     IS 'Auto-incrementing PK';
COMMENT ON COLUMN order_items.order_id          IS 'FK to the parent order';
COMMENT ON COLUMN order_items.product_id        IS 'FK to the ordered product';
COMMENT ON COLUMN order_items.quantity           IS 'How many of this item';
COMMENT ON COLUMN order_items.price             IS 'Snapshot price per unit at time of ordering';
COMMENT ON COLUMN order_items.selected_addons   IS 'JSON array of selected add-ons, e.g. [{"addonID":1,"addonName":"Extra Rice","addonPrice":15.00}]';


-- ────────────────────────────────────────────────────────────────────────────
-- 6. INDEXES  (performance)
-- ────────────────────────────────────────────────────────────────────────────

-- Look up orders by session (used on "Your Orders" page)
CREATE INDEX IF NOT EXISTS idx_orders_session_id
  ON orders(session_id);

-- Look up order items by order (used when displaying order details / receipt)
CREATE INDEX IF NOT EXISTS idx_order_items_order_id
  ON order_items(order_id);

-- Look up addons by product (used when displaying the add-on selection modal)
CREATE INDEX IF NOT EXISTS idx_addons_product_id
  ON addons(product_id);

-- Filter products by availability (used on menu page)
CREATE INDEX IF NOT EXISTS idx_products_status
  ON products(status);

-- Queue number lookup for today's orders (used by queue number generator)
CREATE INDEX IF NOT EXISTS idx_orders_timestamp
  ON orders(order_timestamp);


-- ────────────────────────────────────────────────────────────────────────────
-- 7. QUEUE NUMBER GENERATOR FUNCTION
-- ────────────────────────────────────────────────────────────────────────────
-- Generates the next daily queue number in format Q-001, Q-002, etc.
-- Resets to Q-001 at the start of each day.
-- Call this from your app when a customer confirms an order.

CREATE OR REPLACE FUNCTION generate_queue_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  today_count INT;
  next_number TEXT;
BEGIN
  -- Count how many orders have been placed today
  SELECT COUNT(*) INTO today_count
  FROM orders
  WHERE order_timestamp::date = CURRENT_DATE
    AND queue_number IS NOT NULL;

  -- Format as Q-001, Q-002, etc.
  next_number := 'Q-' || LPAD((today_count + 1)::TEXT, 3, '0');

  RETURN next_number;
END;
$$;

COMMENT ON FUNCTION generate_queue_number() IS 'Returns the next queue number for today (Q-001, Q-002, ...). Resets daily.';


-- ────────────────────────────────────────────────────────────────────────────
-- 8. AUTO-ASSIGN QUEUE NUMBER ON ORDER INSERT (trigger)
-- ────────────────────────────────────────────────────────────────────────────
-- Automatically assigns a queue number when a new order is inserted,
-- so the frontend doesn't need to call the function separately.

CREATE OR REPLACE FUNCTION assign_queue_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.queue_number IS NULL THEN
    NEW.queue_number := generate_queue_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_assign_queue_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION assign_queue_number();


-- ────────────────────────────────────────────────────────────────────────────
-- 9. ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────────────────────
-- Supabase uses RLS to control data access. Since our app uses anonymous
-- auth (no user accounts), we set policies based on the anon role.

-- Enable RLS on all tables
ALTER TABLE guest_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE addons          ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items     ENABLE ROW LEVEL SECURITY;

-- ── GUEST_SESSIONS ──
-- Anon users can create new sessions and read their own session
CREATE POLICY "Anyone can create a guest session"
  ON guest_sessions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can read their own session"
  ON guest_sessions FOR SELECT
  TO anon
  USING (true);
  -- Note: In production, you'd scope this to the session token stored client-side.
  -- For now, sessions are ephemeral and identified by UUID in the frontend.

-- ── PRODUCTS (read-only) ──
CREATE POLICY "Anyone can view available products"
  ON products FOR SELECT
  TO anon
  USING (true);

-- ── ADDONS (read-only) ──
CREATE POLICY "Anyone can view addons"
  ON addons FOR SELECT
  TO anon
  USING (true);

-- ── ORDERS ──
CREATE POLICY "Anon can create orders"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can read orders"
  ON orders FOR SELECT
  TO anon
  USING (true);
  -- Scoped by session_id on the frontend (query filters by session UUID)

-- ── ORDER_ITEMS ──
CREATE POLICY "Anon can create order items"
  ON order_items FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can read order items"
  ON order_items FOR SELECT
  TO anon
  USING (true);


-- ────────────────────────────────────────────────────────────────────────────
-- 10. ENABLE REALTIME  (for order status tracking)
-- ────────────────────────────────────────────────────────────────────────────
-- Enables Supabase Realtime on the orders table so the frontend can
-- subscribe to status changes (Pending → Preparing → Ready).
-- 
-- NOTE: You can also enable this via the Supabase dashboard:
--   Table Editor → orders → Enable Realtime (toggle)
--
-- The SQL approach:
ALTER PUBLICATION supabase_realtime ADD TABLE orders;


-- ────────────────────────────────────────────────────────────────────────────
-- 11. SEED DATA (sample products & addons for development/testing)
-- ────────────────────────────────────────────────────────────────────────────
-- Remove or comment out this section before production deployment.

INSERT INTO products (product_name, price, status, image_path) VALUES
  ('Kare-Kare',              220.00, 'Available', 'images/kare-kare.png'),
  ('Crispy Pork Sisig',      189.00, 'Available', 'images/crispy-pork-sisig.png'),
  ('Kalderetang Kambing',    185.00, 'Available', 'images/kalderetang-kambing.png'),
  ('Kampukan',               195.00, 'Available', 'images/kampukan.png'),
  ('Lechon Kawali',          189.00, 'Available', 'images/lechon-kawali.png'),
  ('Sinigang na Isda',       175.00, 'Available', 'images/sinigang-na-isda.png'),
  ('Pinakbet',               150.00, 'Available', 'images/pinakbet.png'),
  ('Halo-Halo',               85.00, 'Available', 'images/halo-halo.png'),
  ('Buko Juice',              50.00, 'Available', 'images/buko-juice.png'),
  ('Iced Tea',                35.00, 'Available', 'images/iced-tea.png');

INSERT INTO addons (product_id, addon_name, addon_price, status) VALUES
  (1, 'Extra Rice',      15.00, 'Available'),
  (1, 'Extra Sauce',     10.00, 'Available'),
  (2, 'Extra Rice',      15.00, 'Available'),
  (2, 'Extra Egg',       20.00, 'Available'),
  (3, 'Extra Rice',      15.00, 'Available'),
  (3, 'Extra Sauce',     10.00, 'Available'),
  (4, 'Extra Rice',      15.00, 'Available'),
  (5, 'Extra Rice',      15.00, 'Available'),
  (5, 'Extra Sauce',     10.00, 'Available'),
  (6, 'Extra Rice',      15.00, 'Available');


-- ============================================================================
-- DONE! Your Goat2Go Customer Module database is ready.
--
-- NEXT STEPS:
--   1. Enable Anonymous Auth in Supabase dashboard:
--        Authentication → Providers → Anonymous Sign-Ins → Enable
--   2. Scaffold your Vite + React + TypeScript project
--   3. Install Supabase client: npm install @supabase/supabase-js
--   4. Wire up the Supabase client with your project URL and anon key
-- ============================================================================
