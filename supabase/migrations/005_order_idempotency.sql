-- Ensure Stripe idempotency keys remain unique when set
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_stripe_session_id_unique
  ON orders (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent_unique
  ON orders (stripe_payment_intent)
  WHERE stripe_payment_intent IS NOT NULL;

-- Atomic customer stats upsert to avoid race conditions
CREATE OR REPLACE FUNCTION upsert_customer_stats(
  p_email TEXT,
  p_name TEXT,
  p_total_spent INTEGER,
  p_accepts_marketing BOOLEAN
) RETURNS void AS $$
BEGIN
  IF p_email IS NULL OR p_email = '' THEN
    RETURN;
  END IF;

  INSERT INTO customers (email, name, orders_count, total_spent, accepts_marketing)
  VALUES (
    p_email,
    p_name,
    1,
    COALESCE(p_total_spent, 0),
    COALESCE(p_accepts_marketing, false)
  )
  ON CONFLICT (email) DO UPDATE
  SET
    name = COALESCE(EXCLUDED.name, customers.name),
    orders_count = customers.orders_count + 1,
    total_spent = customers.total_spent + EXCLUDED.total_spent,
    accepts_marketing = customers.accepts_marketing OR EXCLUDED.accepts_marketing,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
