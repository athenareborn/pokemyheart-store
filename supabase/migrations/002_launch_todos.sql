-- Launch TODOs Table for Admin Dashboard
-- Tracks all launch tasks with categories, priorities, and statuses

-- ============================================
-- LAUNCH TODOS TABLE
-- ============================================
CREATE TABLE launch_todos (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN (
    'legal', 'storefront', 'admin', 'backend',
    'marketing', 'integrations', 'seo', 'security',
    'analytics', 'content', 'payments', 'email'
  )),
  subcategory TEXT,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'blocked', 'done')),
  assignee TEXT DEFAULT 'ai' CHECK (assignee IN ('human', 'ai', 'both')),
  blocked_by TEXT[], -- Array of todo IDs that block this one
  notes TEXT,
  links TEXT[],
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_todos_category ON launch_todos(category);
CREATE INDEX idx_todos_priority ON launch_todos(priority);
CREATE INDEX idx_todos_status ON launch_todos(status);
CREATE INDEX idx_todos_assignee ON launch_todos(assignee);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE launch_todos ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access to todos" ON launch_todos
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anon to read (for AI agents)
CREATE POLICY "Public read access to todos" ON launch_todos
  FOR SELECT
  TO anon
  USING (true);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE TRIGGER update_launch_todos_updated_at
  BEFORE UPDATE ON launch_todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA - All launch tasks
-- ============================================

-- LEGAL & COMPLIANCE (L1-L6)
INSERT INTO launch_todos (id, category, subcategory, title, description, priority, status, assignee, sort_order) VALUES
('L1', 'legal', 'Compliance', 'Create Privacy Policy page', 'Legal page required for GDPR/CCPA compliance', 'critical', 'done', 'human', 1),
('L2', 'legal', 'Compliance', 'Create Terms of Service page', 'Legal page for terms and conditions', 'critical', 'done', 'human', 2),
('L3', 'legal', 'Compliance', 'Create Shipping Policy page', 'Shipping rates, times, and international shipping info', 'critical', 'done', 'human', 3),
('L4', 'legal', 'Compliance', 'Create Returns/Refunds Policy page', 'Return window, process, and refund timeline', 'critical', 'done', 'human', 4),
('L5', 'legal', 'Compliance', 'Add cookie consent banner (GDPR)', 'Cookie notice for EU compliance', 'critical', 'not_started', 'ai', 5),
('L6', 'legal', 'Compliance', 'Configure sales tax (Stripe Tax)', 'Set up automatic tax calculation', 'critical', 'not_started', 'both', 6);

-- PAYMENTS & CHECKOUT (P1-P5)
INSERT INTO launch_todos (id, category, subcategory, title, description, priority, status, assignee, sort_order) VALUES
('P1', 'payments', 'Stripe', 'Switch Stripe to production mode', 'Activate live Stripe keys and test in production', 'critical', 'not_started', 'human', 10),
('P2', 'payments', 'Testing', 'Test full checkout flow end-to-end', 'Complete test purchase with all payment methods', 'critical', 'not_started', 'both', 11),
('P3', 'payments', 'Webhooks', 'Verify webhook endpoint works in production', 'Confirm order creation via Stripe webhooks', 'critical', 'not_started', 'ai', 12),
('P4', 'payments', 'Methods', 'Add PayPal payment option', 'Integrate PayPal as alternative payment method', 'high', 'not_started', 'ai', 13),
('P5', 'payments', 'Methods', 'Enable Apple Pay / Google Pay', 'Enable digital wallet payments in Stripe', 'high', 'not_started', 'ai', 14);

-- DATABASE & BACKEND (D1-D5)
INSERT INTO launch_todos (id, category, subcategory, title, description, priority, status, assignee, sort_order) VALUES
('D1', 'backend', 'Supabase', 'Create Supabase production project', 'Set up production database instance', 'critical', 'not_started', 'human', 20),
('D2', 'backend', 'Supabase', 'Run database migrations', 'Apply schema migrations to production', 'critical', 'done', 'ai', 21),
('D3', 'backend', 'Security', 'Set up Row Level Security policies', 'Configure RLS for all tables', 'critical', 'done', 'ai', 22),
('D4', 'backend', 'Webhooks', 'Verify order creation webhook works', 'Test Stripe webhook creates orders in DB', 'critical', 'not_started', 'ai', 23),
('D5', 'backend', 'Admin', 'Connect admin dashboard to real data', 'Replace mock data with Supabase queries', 'critical', 'in_progress', 'ai', 24);

-- STOREFRONT FEATURES (S1-S8)
INSERT INTO launch_todos (id, category, subcategory, title, description, priority, status, assignee, sort_order) VALUES
('S1', 'storefront', 'Header', 'Fix header search (implement or remove)', 'Search icon exists but non-functional', 'high', 'not_started', 'ai', 30),
('S2', 'storefront', 'Header', 'Fix user account button (implement or remove)', 'Account icon exists but non-functional', 'high', 'not_started', 'ai', 31),
('S3', 'storefront', 'Footer', 'Connect newsletter form to email service', 'Newsletter signup needs backend integration', 'high', 'not_started', 'ai', 32),
('S4', 'storefront', 'Footer', 'Add social media links to footer', 'Update placeholder # links with real URLs', 'high', 'not_started', 'human', 33),
('S5', 'storefront', 'Errors', 'Create 404 error page', 'Custom not found page', 'high', 'not_started', 'ai', 34),
('S6', 'storefront', 'Errors', 'Create 500 error page', 'Custom server error page', 'high', 'not_started', 'ai', 35),
('S7', 'storefront', 'Reviews', 'Add product reviews system', 'Customer reviews with ratings', 'medium', 'not_started', 'ai', 36),
('S8', 'storefront', 'Features', 'Implement wishlist functionality', 'Save favorites feature', 'medium', 'not_started', 'ai', 37);

-- ADMIN DASHBOARD (A1-A7)
INSERT INTO launch_todos (id, category, subcategory, title, description, priority, status, assignee, sort_order) VALUES
('A1', 'admin', 'Data', 'Connect orders page to Supabase', 'Real orders data instead of mock', 'high', 'done', 'ai', 40),
('A2', 'admin', 'Data', 'Connect customers page to Supabase', 'Real customer data instead of mock', 'high', 'done', 'ai', 41),
('A3', 'admin', 'Data', 'Connect analytics to real data', 'Real analytics from orders/events', 'high', 'not_started', 'ai', 42),
('A4', 'admin', 'Orders', 'Implement order fulfillment workflow', 'Mark orders fulfilled, add tracking', 'high', 'not_started', 'ai', 43),
('A5', 'admin', 'Products', 'Add product CRUD operations', 'Create, edit, delete products', 'high', 'not_started', 'ai', 44),
('A6', 'admin', 'Inventory', 'Build inventory management system', 'Stock tracking and alerts', 'high', 'not_started', 'ai', 45),
('A7', 'admin', 'Tasks', 'Create TODO/tasks page', 'Launch checklist dashboard', 'high', 'in_progress', 'ai', 46);

-- EMAIL & NOTIFICATIONS (E1-E5)
INSERT INTO launch_todos (id, category, subcategory, title, description, priority, status, assignee, sort_order) VALUES
('E1', 'email', 'Setup', 'Configure Resend with production domain', 'Verify domain and set up sending', 'high', 'not_started', 'human', 50),
('E2', 'email', 'Testing', 'Test order confirmation emails', 'Verify email delivery and content', 'high', 'not_started', 'both', 51),
('E3', 'email', 'Testing', 'Test shipping notification emails', 'Verify tracking emails work', 'high', 'not_started', 'both', 52),
('E4', 'email', 'Admin', 'Set up admin notification emails', 'New order alerts for admin', 'medium', 'not_started', 'ai', 53),
('E5', 'email', 'Marketing', 'Create abandoned cart email flow', 'Recover abandoned checkouts', 'medium', 'not_started', 'ai', 54);

-- SEO & DISCOVERABILITY (SEO1-SEO8)
INSERT INTO launch_todos (id, category, subcategory, title, description, priority, status, assignee, sort_order) VALUES
('SEO1', 'seo', 'Technical', 'Generate sitemap.xml', 'Auto-generated sitemap for crawlers', 'high', 'not_started', 'ai', 60),
('SEO2', 'seo', 'Technical', 'Create robots.txt', 'Crawler directives file', 'high', 'not_started', 'ai', 61),
('SEO3', 'seo', 'Schema', 'Add JSON-LD structured data (Product)', 'Product schema for rich results', 'high', 'not_started', 'ai', 62),
('SEO4', 'seo', 'Schema', 'Add Organization schema', 'Business info structured data', 'medium', 'not_started', 'ai', 63),
('SEO5', 'seo', 'Search', 'Submit to Google Search Console', 'Verify ownership and submit sitemap', 'medium', 'not_started', 'human', 64),
('SEO6', 'seo', 'Shopping', 'Create Google Merchant Center feed', 'Product feed for Google Shopping', 'medium', 'not_started', 'both', 65),
('SEO7', 'seo', 'Meta', 'Optimize meta descriptions per page', 'Unique descriptions for all pages', 'medium', 'not_started', 'ai', 66),
('SEO8', 'seo', 'Technical', 'Add canonical URLs', 'Prevent duplicate content issues', 'medium', 'not_started', 'ai', 67);

-- MARKETING & ANALYTICS (M1-M8)
INSERT INTO launch_todos (id, category, subcategory, title, description, priority, status, assignee, sort_order) VALUES
('M1', 'marketing', 'Analytics', 'Install Google Analytics 4', 'GA4 tracking implementation', 'high', 'not_started', 'ai', 70),
('M2', 'marketing', 'Pixels', 'Install Facebook Pixel', 'FB conversion tracking', 'high', 'not_started', 'ai', 71),
('M3', 'marketing', 'Tracking', 'Set up e-commerce conversion tracking (GA4)', 'Purchase and add-to-cart events', 'high', 'not_started', 'ai', 72),
('M4', 'marketing', 'Tracking', 'Set up purchase conversion tracking (FB)', 'Facebook purchase pixel events', 'high', 'not_started', 'ai', 73),
('M5', 'marketing', 'Ads', 'Create Google Ads account', 'Set up Google Ads for paid traffic', 'medium', 'not_started', 'human', 74),
('M6', 'marketing', 'Shopping', 'Link Google Merchant Center', 'Connect Merchant Center to Ads', 'medium', 'not_started', 'human', 75),
('M7', 'marketing', 'Email', 'Set up email marketing (Klaviyo/Mailchimp)', 'Email list and automation', 'medium', 'not_started', 'both', 76),
('M8', 'marketing', 'Analytics', 'Set up Hotjar/Clarity for heatmaps', 'Session recording and heatmaps', 'low', 'not_started', 'ai', 77);

-- INTEGRATIONS (I1-I4)
INSERT INTO launch_todos (id, category, subcategory, title, description, priority, status, assignee, sort_order) VALUES
('I1', 'integrations', 'Shipping', 'Connect shipping carrier (EasyPost/Shippo)', 'Automated shipping labels', 'medium', 'not_started', 'ai', 80),
('I2', 'integrations', 'Support', 'Set up customer support (Intercom/Zendesk)', 'Live chat or help desk', 'medium', 'not_started', 'both', 81),
('I3', 'integrations', 'Social', 'Create Instagram Shop', 'Product catalog on Instagram', 'low', 'not_started', 'human', 82),
('I4', 'integrations', 'Social', 'Create Facebook Shop', 'Product catalog on Facebook', 'low', 'not_started', 'human', 83);

-- PERFORMANCE & SECURITY (PS1-PS6)
INSERT INTO launch_todos (id, category, subcategory, title, description, priority, status, assignee, sort_order) VALUES
('PS1', 'security', 'Performance', 'Run Lighthouse audit, fix issues', 'Performance, accessibility, SEO audit', 'medium', 'not_started', 'ai', 90),
('PS2', 'security', 'Performance', 'Optimize Core Web Vitals', 'LCP, FID, CLS optimization', 'medium', 'not_started', 'ai', 91),
('PS3', 'security', 'Monitoring', 'Set up error monitoring (Sentry)', 'Error tracking and alerting', 'medium', 'not_started', 'ai', 92),
('PS4', 'security', 'Security', 'Configure rate limiting', 'API rate limiting for protection', 'low', 'not_started', 'ai', 93),
('PS5', 'security', 'Backup', 'Set up database backups', 'Automated Supabase backups', 'low', 'not_started', 'human', 94),
('PS6', 'security', 'Auth', 'Add 2FA for admin', 'Two-factor authentication', 'low', 'not_started', 'ai', 95);

-- CONTENT & UX (C1-C5)
INSERT INTO launch_todos (id, category, subcategory, title, description, priority, status, assignee, sort_order) VALUES
('C1', 'content', 'Pages', 'Write About page content', 'Brand story and mission', 'medium', 'done', 'human', 100),
('C2', 'content', 'Media', 'Add more product photos', 'Additional product imagery', 'medium', 'not_started', 'human', 101),
('C3', 'content', 'Pages', 'Create FAQ content updates', 'Expand FAQ with more questions', 'low', 'done', 'human', 102),
('C4', 'content', 'Social', 'Add customer testimonials/UGC', 'Real customer photos/reviews', 'low', 'not_started', 'human', 103),
('C5', 'content', 'Pages', 'Create blog section', 'Blog for content marketing', 'low', 'not_started', 'both', 104);

-- FUTURE FEATURES (F1-F5)
INSERT INTO launch_todos (id, category, subcategory, title, description, priority, status, assignee, sort_order) VALUES
('F1', 'storefront', 'Future', 'Multi-product catalog system', 'Support for multiple products', 'low', 'not_started', 'ai', 110),
('F2', 'storefront', 'Future', 'Customer accounts & order history', 'User registration and login', 'low', 'not_started', 'ai', 111),
('F3', 'admin', 'Future', 'Discount/coupon management', 'Create and manage discount codes', 'low', 'not_started', 'ai', 112),
('F4', 'admin', 'Future', 'Gift card system', 'Sell and redeem gift cards', 'low', 'not_started', 'ai', 113),
('F5', 'admin', 'Future', 'Loyalty program', 'Points and rewards system', 'low', 'not_started', 'ai', 114);
