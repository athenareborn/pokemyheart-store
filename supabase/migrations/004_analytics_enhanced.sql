-- Analytics Enhancement Migration
-- Adds sessions tracking and daily aggregates for production analytics

-- ============================================
-- ANALYTICS SESSIONS TABLE
-- Tracks visitor sessions and funnel progression
-- ============================================
CREATE TABLE analytics_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  visitor_id TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  page_views INTEGER DEFAULT 0,

  -- UTM/Attribution
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer TEXT,
  landing_page TEXT,

  -- Device/Geo
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  country TEXT,
  region TEXT,

  -- Funnel progression flags
  viewed_product BOOLEAN DEFAULT FALSE,
  added_to_cart BOOLEAN DEFAULT FALSE,
  started_checkout BOOLEAN DEFAULT FALSE,
  completed_purchase BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX idx_sessions_started_at ON analytics_sessions(started_at DESC);
CREATE INDEX idx_sessions_visitor_id ON analytics_sessions(visitor_id);
CREATE INDEX idx_sessions_session_id ON analytics_sessions(session_id);
CREATE INDEX idx_sessions_funnel ON analytics_sessions(completed_purchase, started_checkout, added_to_cart, viewed_product);

-- ============================================
-- ANALYTICS DAILY TABLE
-- Pre-computed daily aggregates for fast dashboard queries
-- ============================================
CREATE TABLE analytics_daily (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE UNIQUE NOT NULL,

  -- Traffic metrics
  sessions INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,

  -- Funnel metrics
  product_views INTEGER DEFAULT 0,
  add_to_carts INTEGER DEFAULT 0,
  checkouts_started INTEGER DEFAULT 0,
  purchases INTEGER DEFAULT 0,

  -- Revenue metrics (in cents)
  revenue INTEGER DEFAULT 0,
  orders INTEGER DEFAULT 0,
  aov INTEGER DEFAULT 0,

  -- Computed rates (as percentages * 100 for precision)
  view_to_cart_rate INTEGER DEFAULT 0,
  cart_to_checkout_rate INTEGER DEFAULT 0,
  checkout_to_purchase_rate INTEGER DEFAULT 0,
  overall_conversion_rate INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for date range queries
CREATE INDEX idx_daily_date ON analytics_daily(date DESC);

-- ============================================
-- EXTEND EXISTING ANALYTICS_EVENTS TABLE
-- ============================================
ALTER TABLE analytics_events
ADD COLUMN IF NOT EXISTS visitor_id TEXT,
ADD COLUMN IF NOT EXISTS page_path TEXT,
ADD COLUMN IF NOT EXISTS device_type TEXT,
ADD COLUMN IF NOT EXISTS referrer TEXT;

-- Additional indexes for event queries
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_visitor_id ON analytics_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_page_path ON analytics_events(page_path);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;

-- Sessions: Admin can read, service role can write
CREATE POLICY "Admin can read sessions" ON analytics_sessions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage sessions" ON analytics_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow anon to insert sessions (for tracking from storefront)
CREATE POLICY "Anon can insert sessions" ON analytics_sessions
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update own sessions" ON analytics_sessions
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Daily: Admin can read, service role can write
CREATE POLICY "Admin can read daily" ON analytics_daily
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage daily" ON analytics_daily
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow anon to insert events (for tracking from storefront)
CREATE POLICY "Anon can insert events" ON analytics_events
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON analytics_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_updated_at
  BEFORE UPDATE ON analytics_daily
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
