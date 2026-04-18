# Known Issues — SE2 Team Notification

**Date raised:** April 9, 2026  
**Raised by:** Tyrone Yazon (customer module developer)  
**Audience:** SE2 staff POS team  

This document is a written paper trail of issues observed on the shared Supabase project that fall outside the customer module's scope. These are not blocking the customer app, but they represent security or operational risks that SE2 should be aware of and address on their side.

---

## 1. Anon role has full SQL-level grants on shared tables

**Risk:** High (defense-in-depth gap)

The `anon` role currently holds `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `REFERENCES`, and `TRIGGER` grants on every shared table. RLS policies are the only thing preventing an unauthenticated user from abusing these grants directly.

If any RLS policy is misconfigured or accidentally disabled, there is no second layer of protection. Best practice is to grant only the minimum SQL permissions needed (e.g., `INSERT` only on `orders` for anon, `SELECT` only on `products`), and rely on RLS as a secondary enforcement layer rather than the sole guard.

**Action for SE2:** Review and tighten SQL grants on shared tables for the `anon` role. Coordinate with the customer module developer before changing grants on `guest_sessions`, `orders`, `order_items`, `products`, or `addons` as the customer app depends on specific permissions.

---

## 2. `users` table exposes bcrypt password hashes to the anon key

**Risk:** High (data exposure)

The policy `"Anon can read users for login"` grants `SELECT` on the `users` table to the `anon` role. This means anyone with the public anon key can read the entire staff users table, including bcrypt password hashes.

While bcrypt hashes are not plaintext passwords, exposing them to the public internet is unnecessary and allows offline brute-force attacks if the anon key is ever leaked.

**Action for SE2:** Restrict the `users` SELECT policy to return only the columns actually needed for staff login (e.g., username and role), or switch to a SECURITY DEFINER RPC for the login check so the `users` table is never directly readable by `anon`.

---

## 3. ~~`chk_orders_status` constraint includes `'Ready'` — confirm intended usage~~ — RESOLVED

SE2 confirmed `Ready` is not used as a distinct step in the POS workflow. Orders go directly `Preparing → Completed`.

The customer app has removed all `Ready`-specific frontend handling (badge, polling stop, card styling, active-status filter) as of April 9, 2026.

The DB constraint still permits `'Ready'` at the database level — this is harmless since nothing writes it. SE2 may optionally drop `'Ready'` from `chk_orders_status` to prevent accidental use; this requires no coordination with the customer module.

---

## 4. Missing menu products — verify current state

**Risk:** Low (data accuracy)

A prior handoff document noted that the following products were not yet in the database:
- **Kampukan** — listed as missing
- **Canned Soda** — listed as missing
- **Mountain Dew** — listed as missing

Canned Soda and Mountain Dew may have been added since that document was written. **Please verify current product availability** in the `products` table and coordinate with the customer module developer if any product IDs change, as the frontend cart references products by numeric ID.

---

## 5. No point-in-time recovery or automated backups on free-tier Supabase

**Risk:** Medium (operational risk)

The current project is on Supabase's free tier, which does not include point-in-time recovery (PITR) or automated daily backups. A data loss event (accidental DELETE, migration gone wrong, project reset) would be unrecoverable.

**Action for both teams:** Before going live with real customer traffic, upgrade the Supabase project to a paid plan that includes automated backups, or implement a manual backup schedule (e.g., scheduled `pg_dump` exports). This affects both teams equally since the database is shared.

---

*These issues do not require immediate action from the customer module developer. They are documented here so SE2 has a written record and can address them on their own timeline.*
