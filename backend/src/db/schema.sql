-- Buyoh AI Agent System Database Schema
-- PostgreSQL Database Schema

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    password_hash TEXT,
    loyalty_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure column exists if table already created previously
ALTER TABLE IF EXISTS users
    ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Products table (Fashion only)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('fashion')),
    attributes JSONB DEFAULT '{}',
    price DECIMAL(10, 2) NOT NULL,
    brand VARCHAR(100),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product inventory table
CREATE TABLE IF NOT EXISTS product_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    location_id VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    safety_stock INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, location_id)
);

-- Carts table
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'abandoned', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cart_id, product_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    cart_id UUID REFERENCES carts(id),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')),
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    loyalty_points_applied INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loyalty accounts table
CREATE TABLE IF NOT EXISTS loyalty_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    points_balance INTEGER NOT NULL DEFAULT 0,
    tier VARCHAR(50) DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loyalty transactions table
CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loyalty_account_id UUID NOT NULL REFERENCES loyalty_accounts(id) ON DELETE CASCADE,
    points_delta INTEGER NOT NULL,
    reason VARCHAR(255),
    order_id UUID REFERENCES orders(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offers table
CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category_filter VARCHAR(50) CHECK (category_filter IN ('fashion', NULL)),
    min_cart_value DECIMAL(10, 2) DEFAULT 0,
    discount_type VARCHAR(50) NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'points')),
    discount_value DECIMAL(10, 2) NOT NULL,
    start_at TIMESTAMP WITH TIME ZONE NOT NULL,
    end_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order fulfillments table
CREATE TABLE IF NOT EXISTS order_fulfillments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    tracking_number VARCHAR(100),
    carrier VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'picked', 'in_transit', 'out_for_delivery', 'delivered', 'failed')),
    eta TIMESTAMP WITH TIME ZONE,
    address JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('chat', 'voice')),
    session_id VARCHAR(255),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_product_inventory_product_id ON product_inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_user_id ON loyalty_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_loyalty_account_id ON loyalty_transactions(loyalty_account_id);
CREATE INDEX IF NOT EXISTS idx_offers_active ON offers(is_active, start_at, end_at);
CREATE INDEX IF NOT EXISTS idx_order_fulfillments_order_id ON order_fulfillments(order_id);
CREATE INDEX IF NOT EXISTS idx_order_fulfillments_tracking_number ON order_fulfillments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Full-text search index for products (optional, for better search)
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Realistic seed catalog for local demos and fresh environments.
INSERT INTO products (id, sku, name, description, category, attributes, price, brand, image_url)
VALUES
('11111111-1111-4111-8111-111111111111', 'FAS-MEN-SHIRT-WHITE-001', 'Classic White Oxford Shirt', 'Breathable cotton shirt for office, interviews, and smart casual styling.', 'fashion', '{"audience":"Men","occasion":"Workwear","type":"Shirts","sizes":["S","M","L","XL"],"colors":["White"],"material":"Cotton"}', 1299, 'Buyoh Studio', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=800&fit=crop'),
('22222222-2222-4222-8222-222222222222', 'FAS-WOM-DRESS-SILK-002', 'Elegant Silk Midi Dress', 'Occasion-ready silk blend dress with a clean drape and refined finish.', 'fashion', '{"audience":"Women","occasion":"Wedding","type":"Dresses","sizes":["S","M","L"],"colors":["Rose","Wine"],"material":"Silk blend"}', 2899, 'Aurelia Mode', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop'),
('33333333-3333-4333-8333-333333333333', 'FAS-MEN-JACKET-DENIM-003', 'Casual Denim Jacket', 'Mid-weight denim jacket for layered everyday outfits.', 'fashion', '{"audience":"Men","occasion":"Casual","type":"Jackets","sizes":["M","L","XL"],"colors":["Blue"],"material":"Denim"}', 2499, 'Urban Loom', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop'),
('44444444-4444-4444-8444-444444444444', 'FAS-WOM-KURTA-FESTIVE-004', 'Festive Kurta Set', 'Printed kurta set with comfortable trousers for family events and festivals.', 'fashion', '{"audience":"Women","occasion":"Festive","type":"Ethnic Wear","sizes":["S","M","L","XL"],"colors":["Mustard","Maroon"],"material":"Viscose"}', 3499, 'Riwaaz', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=800&fit=crop'),
('55555555-5555-4555-8555-555555555555', 'FAS-MEN-BLAZER-NAVY-005', 'Premium Navy Blazer', 'Structured blazer for meetings, receptions, and polished evening looks.', 'fashion', '{"audience":"Men","occasion":"Workwear","type":"Blazers","sizes":["M","L","XL"],"colors":["Navy"],"material":"Poly-viscose"}', 4999, 'Boardroom', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=800&fit=crop'),
('66666666-6666-4666-8666-666666666666', 'FAS-WOM-DRESS-FLORAL-006', 'Summer Floral Dress', 'Lightweight floral dress for brunches, travel, and weekend plans.', 'fashion', '{"audience":"Women","occasion":"Casual","type":"Dresses","sizes":["S","M","L"],"colors":["Floral"],"material":"Rayon"}', 1799, 'Mysa', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=800&fit=crop'),
('77777777-7777-4777-8777-777777777777', 'FAS-UNI-TEE-COTTON-007', 'Soft Cotton T-Shirt', 'Everyday cotton crew neck t-shirt with a relaxed fit.', 'fashion', '{"audience":"Unisex","occasion":"Casual","type":"T-Shirts","sizes":["S","M","L","XL"],"colors":["Black","White","Olive"],"material":"Cotton"}', 699, 'DailyForm', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop'),
('88888888-8888-4888-8888-888888888888', 'FAS-WOM-SAREE-DESIGNER-008', 'Designer Occasion Saree', 'Elegant saree with a soft fall, suitable for weddings and receptions.', 'fashion', '{"audience":"Women","occasion":"Wedding","type":"Ethnic Wear","sizes":["One Size"],"colors":["Emerald","Gold"],"material":"Chiffon blend"}', 5999, 'Riwaaz', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=800&fit=crop'),
('99999999-9999-4999-8999-999999999999', 'FAS-KID-DRESS-PARTY-009', 'Kids Party Dress', 'Comfortable party dress for celebrations and school events.', 'fashion', '{"audience":"Kids","occasion":"Festive","type":"Dresses","sizes":["2-3Y","4-5Y","6-7Y"],"colors":["Pink","Lilac"],"material":"Cotton blend"}', 1299, 'LittleJoy', 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&h=800&fit=crop'),
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'FAS-MEN-TROUSER-FORMAL-010', 'Formal Stretch Trousers', 'Slim formal trousers with stretch for all-day office comfort.', 'fashion', '{"audience":"Men","occasion":"Workwear","type":"Bottoms","sizes":["30","32","34","36"],"colors":["Charcoal","Navy"],"material":"Cotton stretch"}', 1899, 'Boardroom', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=800&fit=crop'),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'FAS-WOM-PALAZZO-CASUAL-011', 'Casual Palazzo Pants', 'Easy-fit palazzo pants for everyday ethnic and fusion outfits.', 'fashion', '{"audience":"Women","occasion":"Casual","type":"Bottoms","sizes":["S","M","L","XL"],"colors":["Beige","Black"],"material":"Viscose"}', 1199, 'Mysa', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=800&fit=crop'),
('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'FAS-KID-SHIRT-CASUAL-012', 'Kids Casual Shirt', 'Soft printed shirt for play dates, outings, and family weekends.', 'fashion', '{"audience":"Kids","occasion":"Casual","type":"Shirts","sizes":["2-3Y","4-5Y","6-7Y","8-9Y"],"colors":["Blue","White"],"material":"Cotton"}', 799, 'LittleJoy', 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&h=800&fit=crop')
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  attributes = EXCLUDED.attributes,
  price = EXCLUDED.price,
  brand = EXCLUDED.brand,
  image_url = EXCLUDED.image_url,
  updated_at = NOW();

INSERT INTO product_inventory (product_id, location_id, quantity, safety_stock)
VALUES
('11111111-1111-4111-8111-111111111111', 'blr-warehouse', 42, 5),
('22222222-2222-4222-8222-222222222222', 'blr-warehouse', 21, 4),
('33333333-3333-4333-8333-333333333333', 'blr-warehouse', 18, 3),
('44444444-4444-4444-8444-444444444444', 'blr-warehouse', 30, 6),
('55555555-5555-4555-8555-555555555555', 'blr-warehouse', 12, 2),
('66666666-6666-4666-8666-666666666666', 'blr-warehouse', 33, 5),
('77777777-7777-4777-8777-777777777777', 'blr-warehouse', 80, 10),
('88888888-8888-4888-8888-888888888888', 'blr-warehouse', 9, 2),
('99999999-9999-4999-8999-999999999999', 'blr-warehouse', 24, 4),
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'blr-warehouse', 38, 5),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'blr-warehouse', 45, 5),
('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'blr-warehouse', 52, 8)
ON CONFLICT (product_id, location_id) DO UPDATE SET
  quantity = EXCLUDED.quantity,
  safety_stock = EXCLUDED.safety_stock,
  updated_at = NOW();
