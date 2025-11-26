# Critical Backend Domains (Tier-1)

Critical backend domains are the API areas whose data and workflows directly drive sales, catalog integrity, and reporting. Changes here require tests and extra review because they impact customer-facing transactions and inventory.

## Product — `src/api/product`
- Why critical: Drives the product catalog used in POS/ordering, pricing, and availability across the platform.
- Future tests to add: CRUD and validation for product content types, relations to categories, permissions/role coverage, and any pricing/stock adjustment logic exposed via controllers/services.

## Category — `src/api/category`
- Why critical: Organizes the catalog, powers browsing/filtering, and affects how products surface in POS and reports.
- Future tests to add: CRUD and validation for categories, integrity of product-category relations, permissions checks, and behavior of any list/filter endpoints.

## Sale — `src/api/sale`
- Why critical: Handles revenue-capturing flows (sale creation/landing), transaction recording, and downstream summaries/reports.
- Future tests to add: CRUD and validation for sale records, transaction/line-item handling, relations to products/categories, permissions around creating/reading sales, and summary/report logic exposed by the sale controllers.
