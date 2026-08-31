-- Enum-like columns are plain text so the TypeScript unions (which contain
-- hyphens, e.g. 'pre-order') stay the single source of truth. These CHECK
-- constraints give the money-critical columns the same integrity a Postgres
-- enum would, without leaking naming rules into the app.

ALTER TABLE "orders"
  ADD CONSTRAINT "orders_kind_check"
  CHECK ("kind" IN ('buy', 'pre-order'));

ALTER TABLE "orders"
  ADD CONSTRAINT "orders_plan_check"
  CHECK ("plan" IN ('deposit', 'finance', 'full'));

ALTER TABLE "orders"
  ADD CONSTRAINT "orders_status_check"
  CHECK ("status" IN ('pending', 'paid', 'failed', 'cancelled', 'in-transit', 'ready', 'completed'));

-- Money is whole naira and can never be negative, and the amount taken
-- upfront can never exceed the price of the car.
ALTER TABLE "orders"
  ADD CONSTRAINT "orders_amounts_non_negative_check"
  CHECK ("price" >= 0 AND "amountDueNow" >= 0 AND "balance" >= 0 AND "financeFee" >= 0);

ALTER TABLE "orders"
  ADD CONSTRAINT "orders_deposit_not_over_price_check"
  CHECK ("amountDueNow" <= "price");

-- A pre-order slot can be emptied but never oversold.
ALTER TABLE "preorder_slots"
  ADD CONSTRAINT "preorder_slots_remaining_check"
  CHECK ("remaining" >= 0);

ALTER TABLE "cars"
  ADD CONSTRAINT "cars_status_check"
  CHECK ("status" IN ('available', 'reserved', 'sold'));

ALTER TABLE "cars"
  ADD CONSTRAINT "cars_condition_check"
  CHECK ("condition" IN ('brand-new', 'foreign-used', 'nigerian-used'));

ALTER TABLE "users"
  ADD CONSTRAINT "users_role_check"
  CHECK ("role" IN ('user', 'admin'));

ALTER TABLE "users"
  ADD CONSTRAINT "users_type_check"
  CHECK ("userType" IN ('buyer', 'seller'));
