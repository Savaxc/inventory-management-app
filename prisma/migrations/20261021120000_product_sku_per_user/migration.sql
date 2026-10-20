-- SKU uniqueness is per user, enforced by Product_sku_userId_key.
-- The original global unique index prevented two users from using the
-- same SKU, which is not the intended behavior for a multi-tenant app.
DROP INDEX IF EXISTS "Product_sku_key";
