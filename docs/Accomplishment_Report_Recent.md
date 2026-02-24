# ACCOMPLISHMENT REPORT (Recent)

| Field | Detail |
|-------|--------|
| **Project** | AA2000 Security Website (E-commerce) |
| **Period** | Recent development phase |
| **Prepared by** | Clarence A. Portugal |
| **Position** | Intern |

---

## Summary

Accomplishments in this phase focused on: (1) showing **supplier** information for products across the app and fetching products from supplier endpoints so supplier is always available; (2) adding **specs**, **inclusions**, and **installation price** to the Add product form (Supplier → Products) and displaying them in both the Supplier Products page and the main Admin Products table; (3) improving **layout** so admin and content use full width instead of being cramped in the middle; (4) providing a **migration script** for the `order_items` table to fix checkout errors when the table is missing.

---

## Accomplishments

### 1. Supplier Visible in Products

| Area | Action |
|------|--------|
| **Backend** | GET /api/products and GET /api/products/:id now use `LEFT JOIN suppliers` so each product includes `supplier_name` in the response. POST and PUT product responses also use the same JOIN so created/updated products return with supplier name. |
| **Types** | Added `supplierName?: string \| null` to the `Product` interface in `src/types/index.ts`. |
| **Admin Products table** | Added a **Supplier** column: shows supplier name (linked to `/admin/suppliers/:id/products`) or "—" when none. Table min-width adjusted for the new column. |
| **Context** | `loadProductsFromStorage()` in ProductsContext now preserves `supplierId` and `supplierName` so fallback data does not drop supplier info. |

### 2. Products Fetched from Suppliers (Supplier as Source)

| Area | Action |
|------|--------|
| **New endpoint** | Added GET /api/products/unassigned — returns products where `supplier_id IS NULL` (same shape as other products, `supplierName` null). |
| **API** | Added `fetchProductsFromSuppliers()`: fetches all suppliers and unassigned products in parallel, then for each supplier calls `fetchProductsBySupplier(supplier.id)` and tags each product with `supplierId` and `supplierName`. Combines all and sorts by product id. |
| **fetchProducts()** | `fetchProducts()` in `src/lib/api.ts` now calls `fetchProductsFromSuppliers()` so the product list is built from supplier endpoints and always includes supplier information. |

### 3. Specs, Inclusions, and Installation Price (Forms & Display)

| Area | Action |
|------|--------|
| **Add product (Supplier → Products)** | Form now includes: **Installation price (PHP)**; **Specs (key–value)** with "+ Add" and "×" to add/remove rows; **Inclusions** with "+ Add" and "×" for multiple items (e.g. "1x Camera unit"). Submit sends `specs`, `inclusions`, and `installationPrice` to `createProduct()`. |
| **Supplier Products list** | Table: added **Install** column; **Specs** and **Inclusions** columns (text truncated with full value on hover). Mobile cards: show Specs and Inclusions in a section below price/install when present. |
| **Admin Products table** | Added **Install**, **Specs**, and **Inclusions** columns so all products show installation price, specs summary (key: value · …), and inclusions list (or "—" when empty). |

### 4. Layout: Full Width (No Longer “Siksikan sa Gitna”)

| Area | Action |
|------|--------|
| **AdminLayout** | Removed `max-w-5xl mx-auto` from the main content wrapper. Content now uses `w-full` with padding (`px-4 sm:px-6 lg:px-8`), so the Products table and other admin pages use the full width next to the sidebar. |
| **AdminSupplierProducts** | Removed `max-w-6xl mx-auto` from the page container so the Supplier → Products page also uses full width. |
| **Result** | Admin content (e.g. product table) no longer appears squeezed in the middle with large empty side margins. |

### 5. Checkout: Order Tables Migration

| Area | Action |
|------|--------|
| **Issue** | Checkout could show: "Table 'aa2000.order_items' doesn't exist" when the database was set up without the orders/order_items tables. |
| **Migration script** | Added `scripts/ensure-order-tables.sql`: creates `orders` and `order_items` tables with `CREATE TABLE IF NOT EXISTS` and the same structure as in `schema.sql`. Run with e.g. `mysql -u root -p aa2000 < scripts/ensure-order-tables.sql` to fix the error. |

---

## Files Touched (Recent Phase)

| Category | Files |
|----------|--------|
| **Server** | server/index.js (products JOIN supplier, POST/PUT product with supplier in response; GET /api/products/unassigned) |
| **API** | src/lib/api.ts (fetchProductsFromSuppliers, fetchProductsUnassigned, fetchProducts → fetchProductsFromSuppliers) |
| **Types** | src/types/index.ts (Product.supplierName) |
| **Context** | src/context/ProductsContext.tsx (loadProductsFromStorage: supplierId, supplierName) |
| **Admin layout** | src/pages/admin/AdminLayout.tsx (full-width content wrapper) |
| **Admin Products** | src/pages/admin/AdminProducts.tsx (Supplier, Install, Specs, Inclusions columns; full-width table) |
| **Admin Supplier Products** | src/pages/admin/AdminSupplierProducts.tsx (Add product: installation price, specs, inclusions; table/cards: Install, Specs, Inclusions; full-width container) |
| **Scripts** | scripts/ensure-order-tables.sql (create orders + order_items if missing) |

---

## Notes

- **Supplier:** Products list is now built from supplier endpoints (plus unassigned), so supplier name is always present when a product has a supplier.
- **Specs / Inclusions / Install:** Editable in the Add product form on Supplier → Products and visible in both that page and Admin → Products.
- **Layout:** Admin main area uses full width; no more narrow centered column with wide empty sides.
- **Checkout:** If `order_items` is missing, run `scripts/ensure-order-tables.sql` against the `aa2000` database, then retry Place Order.
